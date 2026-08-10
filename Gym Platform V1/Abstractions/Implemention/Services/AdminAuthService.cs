using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Auth;
using Gym_Management_System.Contexts;
using Microsoft.EntityFrameworkCore;
using Gym_Platform_V1.Entities;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Authentication service implementation for Admin login.
    /// Responsibility: Authenticate Admin users and delegate token generation to ITokenService.
    /// </summary>
    public class AdminAuthService : IAdminAuthService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AdminAuthService> _logger;

        public AdminAuthService(GymPlatformDbContext dbContext, ITokenService tokenService, ILogger<AdminAuthService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Admin> GetAdminById(int id)
        {
            if (id < 0) throw new ArgumentOutOfRangeException(nameof(id));
            var result = await _dbContext.Admins.FirstOrDefaultAsync(a => a.Id == id);
            if (result == null)
            {
                _logger.LogWarning("Admin with ID {AdminId} not found", id);
            }
            if (!result.IsActive)
            {
                _logger.LogWarning("Admin with ID {AdminId} is inactive", id);
            }
            return result;
        }






        /// <summary>
        /// Authenticates an Admin user by username and password.
        /// </summary>
        /// <param name="username">Admin username</param>
        /// <param name="password">Admin password (plain text)</param>
        /// <returns>Login response containing token if successful</returns>
        public async Task<AdminLoginResponseDto> LoginAsync(AdminLoginRequestDto request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
                {
                    _logger.LogWarning("Login attempt with empty credentials");
                    return new AdminLoginResponseDto
                    {
                        Success = false,
                        Message = "Username and password are required"
                    };
                }

                // Find Admin by username
                var admin = await _dbContext.Admins
                    .FirstOrDefaultAsync(a => a.UserName == request.UserName);

                if (admin == null)
                {
                    _logger.LogWarning("Login attempt with non-existent username: {Username}", request.UserName);
                    return new AdminLoginResponseDto
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    };
                }

                // Check if Admin is active
                if (!admin.IsActive)
                {
                    _logger.LogWarning("Login attempt with inactive Admin: {AdminId}", admin.Id);
                    return new AdminLoginResponseDto
                    {
                        Success = false,
                        Message = "Admin account is inactive"
                    };
                }

                // Verify password - Compare password hash with input
                if (!VerifyPassword(request.Password, admin.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for Admin: {AdminId}", admin.Id);
                    return new AdminLoginResponseDto
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    };
                }

                // Generate JWT token
                var token = _tokenService.GenerateToken(admin);

                // Update LastLoginAt
                admin.LastLoginAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Admin logged in successfully: {AdminId}", admin.Id);

                return new AdminLoginResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    Admin = new AdminLoginResponseDto.AdminInfo
                    {
                        Id = admin.Id,
                        FullName = admin.FullName,
                        UserName = admin.UserName,
                        Email = admin.Email
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Admin login");
                return new AdminLoginResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login"
                };
            }
        }

        /// <summary>
        /// Verifies a password against its hash.
        /// Current implementation: Simple comparison (should be replaced with BCrypt in production).
        /// </summary>
        /// <param name="password">Plain text password</param>
        /// <param name="hash">Password hash from database</param>
        /// <returns>True if password matches hash, false otherwise</returns>
        private bool VerifyPassword(string password, string? hash)
        {
            // NOTE: This is a placeholder. In production, use BCrypt.Net-Next or similar:
            // Example with BCrypt:
            // return BCrypt.Net.BCrypt.Verify(password, hash);

            if (string.IsNullOrEmpty(hash))
             return false;
            

            // For development/testing only - compare hash directly
            // In production, use proper hashing algorithm
            return BCrypt.Net.BCrypt.Verify(password, hash); // This should be replaced with proper verification
        }
    }
}
