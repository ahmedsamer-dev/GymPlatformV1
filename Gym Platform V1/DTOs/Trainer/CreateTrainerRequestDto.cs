using System;

namespace Gym_Platform_V1.DTOs.Trainer
{
    public class CreateTrainerRequestDto
    {
        public string? FullName { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal Salary { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime HireDate { get; set; }
        public int GymId { get; set; }
    }
}
