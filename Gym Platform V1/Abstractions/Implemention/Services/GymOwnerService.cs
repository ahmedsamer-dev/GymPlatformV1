using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.GymOwner;
using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Service implementation for GymOwner business operations.
    /// Handles creation, validation, and persistence of GymOwner entities.
    /// Responsible for password hashing and business rule enforcement.
    /// </summary>
    public class GymOwnerService : IGymOwnerService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ILogger<GymOwnerService> _logger;

        /// <summary>
        /// Initializes a new instance of the GymOwnerService class.
        /// </summary>
        /// <param name="dbContext">Database context for data persistence</param>
        /// <param name="logger">Logger for diagnostic and error logging</param>
        /// <exception cref="ArgumentNullException">Thrown if dbContext or logger is null</exception>
        public GymOwnerService(GymPlatformDbContext dbContext, ILogger<GymOwnerService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a new GymOwner with provided details.
        /// Validates business rules and persists to database.
        /// </summary>
        /// <param name="request">GymOwner creation request with validation</param>
        /// <returns>Created GymOwner response (password excluded)</returns>
        /// <exception cref="ArgumentNullException">Thrown if request is null</exception>
        /// <exception cref="InvalidOperationException">Thrown if validation fails</exception>
        public async Task<GymOwnerResponseDto> CreateAsync(CreateGymOwnerRequestDto request)
        {
            try
            {
                // Null validation (defensive check after DTO validation)
                if (request == null)
                {
                    _logger.LogWarning("Received null CreateGymOwnerRequestDto.");
                    throw new ArgumentNullException(nameof(request), "Request cannot be null");
                }

                _logger.LogInformation("Starting GymOwner creation for username: {Username}", request.UserName);

                // ============================================
                // LAYER 2: BUSINESS VALIDATION
                // ============================================

                // Check UserName uniqueness (globally across system)
                var usernameExists = await _dbContext.GymOwners
                    .AsNoTracking()
                    .AnyAsync(g => g.UserName == request.UserName);

                if (usernameExists)
                {
                    _logger.LogWarning("GymOwner creation failed: Username already exists - {Username}", request.UserName);
                    throw new InvalidOperationException($"Username '{request.UserName}' is already taken.");
                }

                // Check Email uniqueness (globally across system)
                var emailExists = await _dbContext.GymOwners
                    .AsNoTracking()
                    .AnyAsync(g => g.Email == request.Email);

                if (emailExists)
                {
                    _logger.LogWarning("GymOwner creation failed: Email already exists - {Email}", request.Email);
                    throw new InvalidOperationException($"Email '{request.Email}' is already registered.");
                }

                // Check PhoneNumber uniqueness (globally across system)
                var phoneExists = await _dbContext.GymOwners
                    .AsNoTracking()
                    .AnyAsync(g => g.PhoneNumber == request.PhoneNumber);

                if (phoneExists)
                {
                    _logger.LogWarning("GymOwner creation failed: Phone already exists - {Phone}", request.PhoneNumber);
                    throw new InvalidOperationException($"PhoneNumber '{request.PhoneNumber}' is already in use.");
                }

                // ============================================
                // PASSWORD HASHING (SECURITY)
                // ============================================
                // Hash password using BCrypt with default work factor
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                _logger.LogInformation("Password hashed successfully for new GymOwner");

                // ============================================
                // CREATE ENTITY INSTANCE
                // ============================================
                var gymOwner = new GymOwner
                {
                    FullName = request.FullName,
                    UserName = request.UserName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    PasswordHash = hashedPassword,      // Hashed password, never plain text
                    IsActive = true,                     // Hardcoded by business logic
                    CreatedAt = DateTime.UtcNow          // Will be overridden by DB default (GETUTCDATE())
                };

                // ============================================
                // PERSIST TO DATABASE
                // ============================================
                _dbContext.GymOwners.Add(gymOwner);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("GymOwner created successfully with ID: {GymOwnerId}, Username: {Username}", 
                    gymOwner.Id, gymOwner.UserName);

                // ============================================
                // CREATE AND RETURN RESPONSE
                // ============================================
                var response = new GymOwnerResponseDto
                {
                    Id = gymOwner.Id,
                    FullName = gymOwner.FullName,
                    UserName = gymOwner.UserName,
                    Email = gymOwner.Email,
                    PhoneNumber = gymOwner.PhoneNumber,
                    CreatedAt = gymOwner.CreatedAt,
                    IsActive = gymOwner.IsActive
                    // Password and PasswordHash intentionally excluded
                };

                return response;
            }
            catch (InvalidOperationException ex)
            {
                // Business validation failed (duplicate, etc.)
                _logger.LogWarning(ex, "Business validation failed for GymOwner creation");
                throw;
            }
            catch (ArgumentNullException ex)
            {
                // Null reference
                _logger.LogError(ex, "Null argument in GymOwner creation");
                throw;
            }
            catch (DbUpdateException ex)
            {
                // Database error (rare - should be caught by uniqueness checks above)
                _logger.LogError(ex, "Database error while creating GymOwner. Possible race condition on unique constraint.");
                throw new InvalidOperationException("An error occurred while creating the GymOwner. Please try again.", ex);
            }
            catch (Exception ex)
            {
                // Unexpected error
                _logger.LogError(ex, "Unexpected error creating GymOwner");
                throw new InvalidOperationException("An unexpected error occurred while creating the GymOwner.", ex);
            }
        }

        /// <summary>
        /// Retrieves all GymOwners in the system.
        /// Read-only operation using AsNoTracking for performance.
        /// Returns only GymOwner summary information (no Gym entities).
        /// </summary>
        /// <returns>Enumerable collection of GymOwnerResponseDto, empty list if no GymOwners exist</returns>
        public async Task<IEnumerable<GymOwnerResponseDto>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all GymOwners");

                // ============================================
                // RETRIEVE FROM DATABASE (READ-ONLY)
                // ============================================
                // Use AsNoTracking() because this is a read-only operation
                // This improves performance by preventing change tracking
                // Use Select() projection to map only required fields directly in query
                // Do NOT include Gyms navigation property
                var gymOwners = await _dbContext.GymOwners
                    .AsNoTracking()
                    .Select(g => new GymOwnerResponseDto
                    {
                        Id = g.Id,
                        FullName = g.FullName,
                        UserName = g.UserName,
                        Email = g.Email,
                        PhoneNumber = g.PhoneNumber,
                        CreatedAt = g.CreatedAt,
                        IsActive = g.IsActive
                        // Password and PasswordHash intentionally excluded for security
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} GymOwners total", gymOwners.Count);

                return gymOwners;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all GymOwners");
                throw;
            }
        }

        /// <summary>
        /// Retrieves a GymOwner by their unique identifier with all related Gyms.
        /// Read-only operation using AsNoTracking for performance.
        /// 
        /// Returns:
        /// - GymOwner basic information
        /// - All Gyms owned by this GymOwner
        /// - Basic information for each Gym
        /// </summary>
        /// <param name="id">The unique identifier of the GymOwner to retrieve</param>
        /// <returns>GymOwnerDetailsDto with Gyms if found, null if not found or id is invalid</returns>
        public async Task<GymOwnerDetailsDto?> GetByIdAsync(int id)
        {
            try
            {
                // Validate id (must be > 0)
                if (id <= 0)
                {
                    _logger.LogWarning("GetByIdAsync called with invalid id: {Id}", id);
                    return null;
                }

                _logger.LogInformation("Retrieving GymOwner with ID: {GymOwnerId} and their Gyms", id);

                // First, load the GymOwner basic information (no navigation properties)
                var owner = await _dbContext.GymOwners
                    .AsNoTracking()
                    .Where(g => g.Id == id)
                    .Select(g => new GymOwnerDetailsDto
                    {
                        Id = g.Id,
                        FullName = g.FullName,
                        UserName = g.UserName,
                        Email = g.Email ?? string.Empty,
                        PhoneNumber = g.PhoneNumber ?? string.Empty,
                        CreatedAt = g.CreatedAt,
                        IsActive = g.IsActive,
                        Gyms = new List<GymSummaryDto>()
                    })
                    .FirstOrDefaultAsync();

                if (owner == null)
                {
                    _logger.LogInformation("GymOwner not found with ID: {GymOwnerId}", id);
                    return null;
                }

                // Load related Gyms explicitly to avoid any projection translation issues

                var gyms = await _dbContext.Gyms
                    .AsNoTracking()
                    .Where(g => g.GymOwnerID == id)
                    .Select(g => new GymSummaryDto
                    {
                        Id = g.Id,
                        Name = g.Name,
                        Address = g.Address,
                        PhoneNumber = g.PhoneNumber,
                        CreatedAt = g.CreatedAt
                    })
                    .ToListAsync();

                owner.Gyms = gyms;

                _logger.LogInformation("GymOwner retrieved successfully - ID: {GymOwnerId}, Username: {Username}, Gym Count: {GymCount}", 
                    owner.Id, owner.UserName, owner.Gyms.Count);

                return owner;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving GymOwner with ID: {GymOwnerId}", id);
                throw;
            }
        }
    }
}
