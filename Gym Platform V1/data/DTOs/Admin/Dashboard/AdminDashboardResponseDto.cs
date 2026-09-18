namespace Gym_Platform_V1.data.DTOs.Admin.Dashboard;

public class AdminDashboardResponseDto
{
    public EntityStatusStatisticsDto Owners { get; set; } = new();
    public EntityStatusStatisticsDto Gyms { get; set; } = new();
    public ApplicationStatisticsDto Applications { get; set; } = new();
    public int TotalTrainers { get; set; }
    public int TotalMembers { get; set; }
}

public class EntityStatusStatisticsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Inactive { get; set; }
}

public class ApplicationStatisticsDto
{
    public int Pending { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}
