using Gym_Platform_V1.DTOs.Auth;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    /// <summary>
    /// Authentication service interface for Admin login.
    /// Responsibility: Authenticate Admin users and return login responses.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Authenticates an Admin user by username and password.
        /// </summary>
        /// <param name="username">Admin username</param>
        /// <param name="password">Admin password (plain text)</param>
        /// <returns>Login response containing token if successful</returns>
        Task<AdminLoginResponseDto> LoginAsync(AdminLoginRequestDto requestDto);
    }
}
