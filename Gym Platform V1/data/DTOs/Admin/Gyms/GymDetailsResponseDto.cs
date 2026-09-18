namespace Gym_Platform_V1.data.DTOs.Admin.Gyms;

public class GymDetailsResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TrainerCount { get; set; }
    public int MemberCount { get; set; }
    public int MembershipPlanCount { get; set; }
}
