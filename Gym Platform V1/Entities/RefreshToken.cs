namespace Gym_Platform_V1.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }

        public string TokenHash { get; set; } = string.Empty;

        public DateTime CreatedOn { get; set; }

        public DateTime ExpirationDate { get; set; }

        public DateTime? RevokedOn { get; set; }

        public int UserId { get; set; }

        public User User { get; set; } = null!;

        public bool IsExpired =>
            DateTime.UtcNow >= ExpirationDate;

        public bool IsActive =>
            RevokedOn == null && !IsExpired;
    }
}

