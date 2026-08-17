    using Gym_Management_System.Contexts;
    using Gym_Management_System.Entities;
    using Gym_Platform_V1.Abstractions.Interfaces;
    using Gym_Platform_V1.DTOs.Trainer;
    using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class TrainerService : ITrainerService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ILogger<TrainerService> _logger;

        public TrainerService(GymPlatformDbContext dbContext, ILogger<TrainerService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<TrainerResponseDto> CreateTrainerAsync(int ownerId, CreateTrainerRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation("CreateTrainer requested by OwnerId: {OwnerId}", ownerId);

            var owner = await _dbContext.GymOwners
                .Include(o => o.Gyms)
                .FirstOrDefaultAsync(o => o.Id == ownerId);

            if (owner == null)
            {
                _logger.LogWarning("GymOwner not found: {OwnerId}", ownerId);
                throw new KeyNotFoundException($"GymOwner with id {ownerId} not found.");
            }

            if (!owner.IsActive)
            {
                _logger.LogWarning("Inactive GymOwner attempted to create Trainer: {OwnerId}", ownerId);
                throw new InvalidOperationException("GymOwner account is inactive");
            }

            // Find the Gym selected by the Owner
            // and verify that it belongs to the authenticated Owner.
            var gym = await _dbContext.Gyms
           .FirstOrDefaultAsync(g =>
            g.Id == request.GymId &&
            g.GymOwnerID == ownerId);
            if (gym == null)
            {
                _logger.LogWarning("GymOwner {OwnerId} has no gym to add Trainer to", ownerId);
                throw new InvalidOperationException("This Gym does not belong to the current GymOwner.");
            }

            // Check username uniqueness among Trainers
            var usernameExists = await _dbContext.Trainers
                .AsNoTracking()
                .AnyAsync(t => t.UserName == request.UserName);

            if (usernameExists)
            {
                _logger.LogWarning("Trainer creation failed - username exists: {UserName}", request.UserName);
                throw new InvalidOperationException($"Username '{request.UserName}' is already taken.");
            }

            // Hash password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password ?? string.Empty);

            var trainer = new Trainer
            {
                FullName = request.FullName,
                UserName = request.UserName,
                PasswordHash = hashedPassword,
                PhoneNumber = request.PhoneNumber,
                Salary = request.Salary,
                Address = request.Address,
                ImageUrl = request.ImageUrl,
                HireDate = request.HireDate,
                GymId = gym.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Trainers.Add(trainer);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Trainer created successfully. TrainerId: {TrainerId}, GymId: {GymId}", trainer.Id, gym.Id);

            return new TrainerResponseDto
            {
                Id = trainer.Id,
                FullName = trainer.FullName,
                UserName = trainer.UserName,
                PhoneNumber = trainer.PhoneNumber,
                Salary = trainer.Salary,
                Address = trainer.Address,
                HireDate = trainer.HireDate,
                ImageUrl = trainer.ImageUrl,
                GymId = trainer.GymId,
                GymName = gym.Name,
                CreatedAt = trainer.CreatedAt,
                IsActive = trainer.IsActive
            };
        }

        public async Task<List<TrainerResponseDto>> GetTrainersAsync(
       int ownerId,
       int? gymId)
        {
            _logger.LogInformation("Retrieving trainers for OwnerId: {OwnerId}, GymId: {GymId}", ownerId, gymId);

            var query = _dbContext.Trainers
                .AsNoTracking()
                .Where(t => t.Gym != null &&
                            t.Gym.GymOwnerID == ownerId);

            if (gymId.HasValue)
            {
                _logger.LogInformation("Filtering trainers by GymId: {GymId}", gymId.Value);
                query = query.Where(t => t.GymId == gymId.Value);
            }

            var trainers = await query
                .Select(t => new TrainerResponseDto
                {
                    Id = t.Id,
                    FullName = t.FullName ?? string.Empty,
                    UserName = t.UserName ?? string.Empty,
                    PhoneNumber = t.PhoneNumber ?? string.Empty,
                    Salary = t.Salary,
                    Address = t.Address ?? string.Empty,
                    HireDate = t.HireDate,
                    ImageUrl = t.ImageUrl,
                    IsActive = t.IsActive,
                    CreatedAt = t.CreatedAt,
                    GymId = t.GymId,
                    GymName = t.Gym!.Name
                })
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} trainers for OwnerId: {OwnerId}", trainers.Count, ownerId);

            return trainers;
        }

        // Updates an existing Trainer's editable fields and optionally moves them to a different Gym.
        //
        // ownerId: extracted from JWT — never accepted from the client.
        // trainerId: from the route parameter.
        // gymId: optional query parameter — when provided, the Trainer is moved to that Gym
        //        but ONLY if the Gym belongs to the same authenticated Owner.
        //
        // Only the following fields are updated (PasswordHash, UserName, IsActive, CreatedAt are excluded):
        //   FullName, PhoneNumber, Salary, Address, ImageUrl, HireDate
        public async Task<TrainerResponseDto> UpdateTrainerAsync(int ownerId, int trainerId, UpdateTrainerRequestDto request, int? gymId)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation("UpdateTrainer requested by OwnerId: {OwnerId} for TrainerId: {TrainerId}", ownerId, trainerId);

            // Load the Trainer WITH its Gym navigation so we can verify ownership.
            // Do NOT use AsNoTracking here — EF Core change tracking is needed to persist updates
            // via SaveChangesAsync without re-attaching the entity.


            var trainer = await _dbContext.Trainers
                .Include(t => t.Gym)
                .FirstOrDefaultAsync(t => t.Id == trainerId);
            //var trainer = await _dbContext.Trainers
            //    .Include(t => t.Gym)
            //    .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            // Ownership check: the Trainer must belong to one of the authenticated Owner's Gyms.
            // This prevents Owner A from updating a Trainer that belongs to Owner B's Gym.
            if (trainer.Gym == null || trainer.Gym.GymOwnerID != ownerId)
            {
                _logger.LogWarning("OwnerId {OwnerId} attempted to update TrainerId {TrainerId} that does not belong to them", ownerId, trainerId);
                throw new UnauthorizedAccessException("You can only update trainers that belong to your gyms.");
            }

            // Optional gym move: if gymId is supplied, the Trainer will be moved to that Gym,
            // but the target Gym must belong to the SAME authenticated Owner.
            // This prevents an Owner from moving a Trainer into another Owner's Gym.
            if (gymId.HasValue)
            {
                _logger.LogInformation("Gym move requested: TrainerId {TrainerId} to GymId {GymId}", trainerId, gymId.Value);

                // Use AsNoTracking here because we only need to verify existence/ownership;
                // we are not modifying the Gym entity itself.
                var targetGym = await _dbContext.Gyms
                    .AsNoTracking()
                    .FirstOrDefaultAsync(g => g.Id == gymId.Value && g.GymOwnerID == ownerId);

                if (targetGym == null)
                {
                    _logger.LogWarning("OwnerId {OwnerId} attempted to move Trainer to GymId {GymId} which does not exist or does not belong to them", ownerId, gymId.Value);
                    throw new InvalidOperationException($"Gym with id {gymId.Value} not found or does not belong to you.");
                }

                trainer.GymId = targetGym.Id;
            }

            // Update only the editable fields.
            // UserName, PasswordHash, IsActive, and CreatedAt are intentionally NOT modified here.
            trainer.FullName = request.FullName;
            trainer.PhoneNumber = request.PhoneNumber;
            trainer.Salary = request.Salary;
            trainer.Address = request.Address;
            trainer.ImageUrl = request.ImageUrl;
            trainer.HireDate = request.HireDate;

            await _dbContext.SaveChangesAsync();

            // Reload the Gym navigation to reflect the potentially new Gym name in the response.
            // After changing GymId, the original .Gym reference may be stale.
         await _dbContext.Entry(trainer).Reference(t => t.Gym).LoadAsync();

            _logger.LogInformation("Trainer updated successfully. TrainerId: {TrainerId}, GymId: {GymId}", trainer.Id, trainer.GymId);

            return new TrainerResponseDto
            {
                Id = trainer.Id,
                FullName = trainer.FullName,
                UserName = trainer.UserName,
                PhoneNumber = trainer.PhoneNumber,
                Salary = trainer.Salary,
                Address = trainer.Address,
                HireDate = trainer.HireDate,
                ImageUrl = trainer.ImageUrl,
                GymId = trainer.GymId,
                GymName = trainer.Gym?.Name,
                CreatedAt = trainer.CreatedAt,
                IsActive = trainer.IsActive
            };
        }

        // Retrieves a single Trainer by Id, but ONLY if the Trainer belongs to a Gym owned by the authenticated Owner.
        //
        // trainerId: from the route parameter.
        // ownerId: from JWT — never from the client.
        //
        // The ownership condition is included directly in the database query so that:
        //   - We do NOT need a separate query against the GymOwners table.
        //   - A Trainer belonging to another Owner is treated as "not found" rather than "unauthorized",
        //     which avoids leaking information about other Owners' resources.
        //
        // AsNoTracking is used because this is a read-only operation — no entity modification is needed.
        // PasswordHash is never included in the response DTO.
        public async Task<TrainerResponseDto?> GetTrainerByIdAsync(int ownerId, int trainerId)
        {
            _logger.LogInformation("GetTrainerById requested by OwnerId: {OwnerId} for TrainerId: {TrainerId}", ownerId, trainerId);

            // The query filters by both Trainer.Id AND Trainer.Gym.GymOwnerID in a single round-trip.
            // This ensures the Trainer exists AND belongs to the authenticated Owner's Gym.
            var trainer = await _dbContext.Trainers
                .AsNoTracking()
                .Where(t => t.Id == trainerId &&
                            t.Gym != null &&
                            t.Gym.GymOwnerID == ownerId)
                .Select(t => new TrainerResponseDto
                {
                    Id = t.Id,
                    FullName = t.FullName ?? string.Empty,
                    UserName = t.UserName ?? string.Empty,
                    PhoneNumber = t.PhoneNumber ?? string.Empty,
                    Salary = t.Salary,
                    Address = t.Address ?? string.Empty,
                    HireDate = t.HireDate,
                    ImageUrl = t.ImageUrl,
                    IsActive = t.IsActive,
                    CreatedAt = t.CreatedAt,
                    GymId = t.GymId,
                    GymName = t.Gym!.Name
                })
                .FirstOrDefaultAsync();

            if (trainer == null)
            {
                // Whether the Trainer doesn't exist or belongs to another Owner,
                // we log the same generic message to avoid leaking information.
                _logger.LogWarning("Trainer with Id {TrainerId} not found or not accessible by OwnerId: {OwnerId}", trainerId, ownerId);
            }
            else
            {
                _logger.LogInformation("Trainer retrieved successfully. TrainerId: {TrainerId}, GymId: {GymId}", trainer.Id, trainer.GymId);
            }

            return trainer;
        }
    }
    }
