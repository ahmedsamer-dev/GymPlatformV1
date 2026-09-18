using Gym_Management_System.Contexts;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.data.DTOs.Admin.Dashboard;
using Gym_Platform_V1.enums;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly GymPlatformDbContext _dbContext;

    public AdminDashboardService(GymPlatformDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<AdminDashboardResponseDto> GetStatisticsAsync()
    {
        var totalOwners = await _dbContext.GymOwners.CountAsync();
        var activeOwners = await _dbContext.GymOwners.CountAsync(o => o.IsActive);
        var totalGyms = await _dbContext.Gyms.CountAsync();
        var activeGyms = await _dbContext.Gyms.CountAsync(g => g.IsActive);

        return new AdminDashboardResponseDto
        {
            Owners = new EntityStatusStatisticsDto
            {
                Total = totalOwners,
                Active = activeOwners,
                Inactive = totalOwners - activeOwners
            },
            Gyms = new EntityStatusStatisticsDto
            {
                Total = totalGyms,
                Active = activeGyms,
                Inactive = totalGyms - activeGyms
            },
            Applications = new ApplicationStatisticsDto
            {
                Pending = await _dbContext.GymOwnerApplications.CountAsync(a => a.Status == ApplicationStatus.Pending),
                Approved = await _dbContext.GymOwnerApplications.CountAsync(a => a.Status == ApplicationStatus.Approved),
                Rejected = await _dbContext.GymOwnerApplications.CountAsync(a => a.Status == ApplicationStatus.Rejected)
            },
            TotalTrainers = await _dbContext.Trainers.CountAsync(),
            TotalMembers = await _dbContext.Members.CountAsync()
        };
    }
}
