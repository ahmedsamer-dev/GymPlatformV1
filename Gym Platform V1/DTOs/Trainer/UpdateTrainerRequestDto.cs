using System;

namespace Gym_Platform_V1.DTOs.Trainer
{
    // Only the fields that a GymOwner is allowed to edit on a Trainer.
    // Id, UserName, Password, PasswordHash, CreatedAt, and IsActive are intentionally excluded.
    // UserName and password changes (if ever needed) should have dedicated endpoints.
    // IsActive is managed by a separate Activate/Deactivate endpoint.
    public class UpdateTrainerRequestDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal Salary { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime HireDate { get; set; }
    }
}
