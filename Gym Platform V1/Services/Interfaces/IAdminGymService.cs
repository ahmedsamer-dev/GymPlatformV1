using Gym_Platform_V1.data.DTOs.Admin.Common;
using Gym_Platform_V1.data.DTOs.Admin.Gyms;

namespace Gym_Platform_V1.Abstractions.Interfaces;

public interface IAdminGymService
{
    Task<PagedResponseDto<GymListResponseDto>> GetPagedAsync(GymListRequestDto request);
    Task<GymDetailsResponseDto?> GetDetailsAsync(int id);
    Task SetStatusAsync(int id, bool active);
}
