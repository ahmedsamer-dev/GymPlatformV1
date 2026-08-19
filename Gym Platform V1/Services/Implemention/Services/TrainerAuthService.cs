using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Auth;
using Gym_Management_System.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Authentication service implementation for Trainer login.
    /// Responsibility: Authenticate Trainer users and delegate token generation to ITokenService.
    /// </summary>
    public class TrainerAuthService : ITrainerAuthService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly ILogger<TrainerAuthService> _logger;

        public TrainerAuthService(GymPlatformDbContext dbContext, ITokenService tokenService, ILogger<TrainerAuthService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Authenticates a Trainer by username and password.
        /// </summary>
        /// <param name="request">Login request containing username and password</param>
        /// <returns>Login response with token if successful</returns>
        public async Task<TrainerLoginResponseDto> LoginAsync(TrainerLoginRequestDto request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
                {
                    _logger.LogWarning("Login attempt with empty credentials");
                    return new TrainerLoginResponseDto
                    {
                        Success = false,
                        Message = "Username and password are required"
                    };
                }

                // Find Trainer by username
                var trainer = await _dbContext.Trainers
                    .FirstOrDefaultAsync(t => t.UserName == request.UserName);

                if (trainer == null)
                {
                    _logger.LogWarning("Login attempt with non-existent username: {UserName}", request.UserName);
                    return new TrainerLoginResponseDto
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    };
                }

                // Check if Trainer is active
                if (!trainer.IsActive)
                {
                    _logger.LogWarning("Login attempt with inactive Trainer: {TrainerId}", trainer.Id);
                    return new TrainerLoginResponseDto
                    {
                        Success = false,
                        Message = "Trainer account is inactive"
                    };
                }

                // Verify password - Compare password hash with input
                if (!VerifyPassword(request.Password, trainer.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for Trainer: {TrainerId}", trainer.Id);
                    return new TrainerLoginResponseDto
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    };
                }

                // Generate JWT token
                var token = _tokenService.GenerateToken(trainer);

                _logger.LogInformation("Trainer logged in successfully: {TrainerId}", trainer.Id);

                return new TrainerLoginResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    Trainer = new TrainerLoginResponseDto.TrainerInfo
                    {
                        Id = trainer.Id,
                        FullName = trainer.FullName,
                        UserName = trainer.UserName,
                        GymId = trainer.GymId
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Trainer login");
                return new TrainerLoginResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login"
                };
            }
        }

        /// <summary>
        /// Verifies a password against its hash using BCrypt.
        /// </summary>
        /// <param name="password">Plain text password</param>
        /// <param name="hash">Password hash from database</param>
        /// <returns>True if password matches hash, false otherwise</returns>
        private bool VerifyPassword(string password, string? hash)
        {
            if (string.IsNullOrEmpty(hash))
                return false;

            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
