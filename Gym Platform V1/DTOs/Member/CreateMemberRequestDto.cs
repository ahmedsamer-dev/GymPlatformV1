using System.ComponentModel.DataAnnotations;

namespace Gym_Platform_V1.DTOs.Member
{
    public class CreateMemberRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [RegularExpression(@"^01[0125][0-9]{8}$",
    ErrorMessage = "Invalid Egyptian phone number.")]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
