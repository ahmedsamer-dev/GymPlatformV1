namespace Gym_Platform_V1.data.DTOs.Admin.Owners;

public class OwnerDetailsResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int GymCount { get; set; }
    public int ActiveGymCount { get; set; }
    public int TrainerCount { get; set; }
    public int MemberCount { get; set; }
}
