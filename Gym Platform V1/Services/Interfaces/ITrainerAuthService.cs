using Gym_Platform_V1.data.DTOs.Auth;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    /// <summary>
    /// Service interface for Trainer authentication.
    /// Responsibility: Handle Trainer login and JWT token generation.
    /// </summary>
    public interface ITrainerAuthService
    {
        /// <summary>
        /// Authenticates a Trainer by username and password.
        /// </summary>
        /// <param name="request">Login request containing username and password</param>
        /// <returns>Login response with token if successful</returns>
        Task<TrainerLoginResponseDto> LoginAsync(TrainerLoginRequestDto request);
    }
}
