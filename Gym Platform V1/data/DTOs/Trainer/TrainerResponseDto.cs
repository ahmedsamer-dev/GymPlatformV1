using System;

namespace Gym_Platform_V1.data.DTOs.Trainer
{
    public class TrainerResponseDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? UserName { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal Salary { get; set; }
        public string? Address { get; set; }
        public DateTime HireDate { get; set; }
        public string? ImageUrl { get; set; }
        public int GymId { get; set; }
        public string? GymName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
