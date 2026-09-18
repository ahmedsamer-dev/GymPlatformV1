using Gym_Platform_V1.data.DTOs.Admin.Dashboard;

namespace Gym_Platform_V1.Abstractions.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardResponseDto> GetStatisticsAsync();
}
