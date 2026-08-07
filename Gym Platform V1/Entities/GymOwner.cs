using System;

namespace Gym_Management_System.Entities
{
    public class GymOwner
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<Gym> Gyms { get; set; }

    }
}
