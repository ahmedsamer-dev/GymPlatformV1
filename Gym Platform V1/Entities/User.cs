namespace Gym_Platform_V1.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        public Admin? Admin { get; set; }
        public Gym_Management_System.Entities.GymOwner? GymOwner { get; set; }
        public Gym_Management_System.Entities.Trainer? Trainer { get; set; }
    }
}