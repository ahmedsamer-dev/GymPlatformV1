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
        }
    }
