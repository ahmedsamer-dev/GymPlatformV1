namespace Gym_Platform_V1.data.DTOs.Auth
{
    public class GymOwnerLoginResponseDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? Token { get; set; }

        public GymOwnerInfo? Owner { get; set; }

        public class GymOwnerInfo
        {
            public int Id { get; set; }
            public string? FullName { get; set; }
            public string? UserName { get; set; }
            public string? Email { get; set; }
        }
    }
}
