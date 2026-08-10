using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.GymOwnerApplication;
using Gym_Platform_V1.Entities;
using Gym_Platform_V1.enums;

using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class GymOwnerApplicationService : IGymOwnerApplicationService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ILogger<GymOwnerApplicationService> _logger;

        public GymOwnerApplicationService(GymPlatformDbContext dbContext, ILogger<GymOwnerApplicationService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<GymOwnerApplicationResponseDto> SubmitApplicationAsync(CreateGymOwnerApplicationRequestDto request)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            // Basic service-level validation
            _logger.LogInformation("Submitting new GymOwner application for username: {UserName}, email: {Email}", request.UserName, request.Email);

            // Check duplicates in approved GymOwners
            var duplicateInOwners = await _dbContext.GymOwners
                .AsNoTracking()
                .AnyAsync(o => o.UserName == request.UserName || o.Email == request.Email || o.PhoneNumber == request.PhoneNumber);

            if (duplicateInOwners)
            {
                _logger.LogWarning("Application submission failed due to duplicate in GymOwners: {UserName} / {Email} / {Phone}", request.UserName, request.Email, request.PhoneNumber);
                throw new InvalidOperationException("An account with the same username, email, or phone number already exists.");
            }

            // Check duplicates in pending or existing applications (username, email, phone)
            var duplicateInApplications = await _dbContext.GymOwnerApplications
                .AsNoTracking()
                .AnyAsync(a => a.UserName == request.UserName || a.Email == request.Email || a.PhoneNumber == request.PhoneNumber || a.Status == ApplicationStatus.Pending);

            if (duplicateInApplications)
            {
                _logger.LogWarning("Application submission failed due to existing application: {UserName} / {Email} / {Phone}", request.UserName, request.Email, request.PhoneNumber);
                throw new InvalidOperationException("An application with the same username, email, or phone number already exists.");
            }

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var application = new GymOwnerApplication
            {
                FullName = request.FullName,
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = hashedPassword,
                GymName = request.GymName,
                GymAddress = request.GymAddress,
                GymPhoneNumber = request.GymPhoneNumber,
                Status = Gym_Platform_V1.enums.ApplicationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.GymOwnerApplications.Add(application);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Application submitted successfully with ID: {ApplicationId}", application.Id);

            var response = new GymOwnerApplicationResponseDto
            {
                Id = application.Id,
                FullName = application.FullName,
                UserName = application.UserName,
                Email = application.Email,
                PhoneNumber = application.PhoneNumber,
                GymName = application.GymName,
                GymAddress = application.GymAddress,
                GymPhoneNumber = application.GymPhoneNumber,
                Status = application.Status,
                CreatedAt = application.CreatedAt,
                ReviewedAt = application.ReviewedAt,
                RejectionReason = application.RejectionReason
            };

            return response;
        }

        public async Task<IEnumerable<GymOwnerApplicationResponseDto>> GetApplicationsAsync()
        {
            _logger.LogInformation("Retrieving all GymOwner applications");

            var list = await _dbContext.GymOwnerApplications
                .AsNoTracking()
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new GymOwnerApplicationResponseDto
                {
                    Id = a.Id,
                    FullName = a.FullName,
                    UserName = a.UserName,
                    Email = a.Email,
                    PhoneNumber = a.PhoneNumber,
                    GymName = a.GymName,
                    GymAddress = a.GymAddress,
                    GymPhoneNumber = a.GymPhoneNumber,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    ReviewedAt = a.ReviewedAt,
                    RejectionReason = a.RejectionReason
                })
                .ToListAsync();

            return list;
        }

        public async Task ApproveApplicationAsync(int applicationId)
        {
            _logger.LogInformation("Approving application with ID: {ApplicationId}", applicationId);

            // Retrieve application with tracking because we'll update it
            var application = await _dbContext.GymOwnerApplications
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                _logger.LogWarning("Application not found: {ApplicationId}", applicationId);
                throw new KeyNotFoundException($"Application with id {applicationId} not found.");
            }

            if (application.Status != Gym_Platform_V1.enums.ApplicationStatus.Pending)
            {
                _logger.LogWarning("Attempted to approve non-pending application: {ApplicationId} Status: {Status}", applicationId, application.Status);
                throw new InvalidOperationException("Only pending applications can be approved.");
            }

            // Check uniqueness again to avoid race conditions
            var existsOwner = await _dbContext.GymOwners
                .AsNoTracking()
                .AnyAsync(o => o.UserName == application.UserName || o.Email == application.Email || o.PhoneNumber == application.PhoneNumber);

            if (existsOwner)
            {
                _logger.LogWarning("Cannot approve application because a GymOwner with same credentials exists: {UserName} / {Email} / {Phone}", application.UserName, application.Email, application.PhoneNumber);
                throw new InvalidOperationException("Cannot approve application because a GymOwner with the same username, email, or phone number already exists.");
            }

            // Use transaction for the approval workflow
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // Create GymOwner
                var gymOwner = new GymOwner
                {
                    FullName = application.FullName,
                    UserName = application.UserName,
                    Email = application.Email,
                    PhoneNumber = application.PhoneNumber,
                    PasswordHash = application.PasswordHash,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.GymOwners.Add(gymOwner);
                await _dbContext.SaveChangesAsync();

                // Create Gym and link to GymOwner
                var gym = new Gym_Management_System.Entities.Gym
                {
                    Name = application.GymName,
                    Address = application.GymAddress,
                    PhoneNumber = application.GymPhoneNumber,
                    CreatedAt = DateTime.UtcNow,
                    GymOwnerID = gymOwner.Id //
                };

                _dbContext.Gyms.Add(gym);
                await _dbContext.SaveChangesAsync();

                // Update application status
                application.Status = Gym_Platform_V1.enums.ApplicationStatus.Approved;
                application.ReviewedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Application approved and GymOwner/Gym created. ApplicationId: {ApplicationId}, GymOwnerId: {GymOwnerId}, GymId: {GymId}", applicationId, gymOwner.Id, gym.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during application approval. Rolling back. ApplicationId: {ApplicationId}", applicationId);
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task RejectApplicationAsync(int applicationId, string rejectionReason)
        {
            if (string.IsNullOrWhiteSpace(rejectionReason))
            {
                throw new ArgumentException("Rejection reason is required", nameof(rejectionReason));
            }

            _logger.LogInformation("Rejecting application with ID: {ApplicationId}", applicationId);

            var application = await _dbContext.GymOwnerApplications
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                _logger.LogWarning("Application not found for rejection: {ApplicationId}", applicationId);
                throw new KeyNotFoundException($"Application with id {applicationId} not found.");
            }

            if (application.Status != Gym_Platform_V1.enums.ApplicationStatus.Pending)
            {
                _logger.LogWarning("Attempted to reject non-pending application: {ApplicationId} Status: {Status}", applicationId, application.Status);
                throw new InvalidOperationException("Only pending applications can be rejected.");
            }

            application.Status = Gym_Platform_V1.enums.ApplicationStatus.Rejected;
            application.ReviewedAt = DateTime.UtcNow;
            application.RejectionReason = rejectionReason;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Application rejected: {ApplicationId}", applicationId);
        }
     
        public async Task<IEnumerable<GymOwnerApplicationResponseDto>>
        GetPendingApplicationsAsync()
        {
            return await _dbContext.GymOwnerApplications
                .AsNoTracking()
                .Where(x => x.Status == ApplicationStatus.Pending)
                .Select(x => new GymOwnerApplicationResponseDto
                {
                    Id = x.Id,
                    FullName = x.FullName,
                    UserName = x.UserName,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    GymName = x.GymName,
                    GymAddress = x.GymAddress,
                    GymPhoneNumber = x.GymPhoneNumber,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    ReviewedAt = x.ReviewedAt,
                    RejectionReason = x.RejectionReason
                })
                .ToListAsync();
        }
    }
}
