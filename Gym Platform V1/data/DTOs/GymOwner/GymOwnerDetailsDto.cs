namespace Gym_Platform_V1.data.DTOs.GymOwner
{
    public class GymOwnerDetailsDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        public List<GymSummaryDto> Gyms { get; set; } = new();
    }
}
