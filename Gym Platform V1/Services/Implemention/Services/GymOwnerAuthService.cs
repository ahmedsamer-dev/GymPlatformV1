using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Management_System.Contexts;
using Microsoft.EntityFrameworkCore;
using Gym_Platform_V1.data.DTOs.Auth;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class GymOwnerAuthService : IGymOwnerAuthService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly ILogger<GymOwnerAuthService> _logger;

        public GymOwnerAuthService(GymPlatformDbContext dbContext, ITokenService tokenService, ILogger<GymOwnerAuthService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<GymOwnerLoginResponseDto> LoginAsync(GymOwnerLoginRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return new GymOwnerLoginResponseDto
                    {
                        Success = false,
                        Message = "Username and password are required"
                    };
                }

                var owner = await _dbContext.GymOwners.FirstOrDefaultAsync(g => g.UserName == request.UserName);

                if (owner == null)
                {
                    _logger.LogWarning("GymOwner login attempt for non-existent username: {UserName}", request.UserName);
                    return new GymOwnerLoginResponseDto { Success = false, Message = "Invalid username or password" };
                }

                if (!owner.IsActive)
                {
                    _logger.LogWarning("Attempt to login inactive GymOwner: {OwnerId}", owner.Id);
                    return new GymOwnerLoginResponseDto { Success = false, Message = "GymOwner account is inactive" };
                }

                if (!VerifyPassword(request.Password, owner.PasswordHash))
                {
                    _logger.LogWarning("Failed login for GymOwner: {OwnerId}", owner.Id);
                    return new GymOwnerLoginResponseDto { Success = false, Message = "Invalid username or password" };
                }

                var token = _tokenService.GenerateToken(owner);

                _logger.LogInformation("GymOwner logged in successfully: {OwnerId}", owner.Id);

                return new GymOwnerLoginResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    Owner = new GymOwnerLoginResponseDto.GymOwnerInfo
                    {
                        Id = owner.Id,
                        FullName = owner.FullName,
                        UserName = owner.UserName,
                        Email = owner.Email
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during GymOwner login");
                return new GymOwnerLoginResponseDto { Success = false, Message = "An error occurred during login" };
            }
        }

        private bool VerifyPassword(string password, string? hash)
        {
            if (string.IsNullOrEmpty(hash)) return false;
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
