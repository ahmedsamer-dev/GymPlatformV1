using Gym_Platform_V1.DTOs.Auth;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface IGymOwnerAuthService
    {
        Task<GymOwnerLoginResponseDto> LoginAsync(GymOwnerLoginRequestDto request);
    }
}
