using System.ComponentModel.DataAnnotations;

namespace Gym_Platform_V1.DTOs.GymOwnerApplication
{
    public class RejectApplicationRequestDto
    {
        [Required(ErrorMessage = "Rejection reason is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Rejection reason must be between 5 and 500 characters")]
        public string RejectionReason { get; set; } = string.Empty;
    }
}
