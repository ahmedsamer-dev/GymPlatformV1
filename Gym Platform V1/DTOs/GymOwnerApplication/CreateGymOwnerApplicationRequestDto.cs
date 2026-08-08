using System.ComponentModel.DataAnnotations;

namespace Gym_Platform_V1.DTOs.GymOwnerApplication
{
    /// <summary>
    /// Data Transfer Object for creating a GymOwnerApplication.
    /// 
    /// This DTO represents an application from a person requesting to become a GymOwner.
    /// The applicant provides personal information and basic gym details.
    /// 
    /// Business Rule:
    /// - The applicant is NOT a GymOwner yet.
    /// - This is an independent request.
    /// - No relationship to existing GymOwner exists.
    /// - After Admin approval, a GymOwner and Gym entity will be created separately.
    /// </summary>
    public class CreateGymOwnerApplicationRequestDto
    {
        /// <summary>
        /// Full name of the applicant.
        /// </summary>
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Username requested by the applicant.
        /// Will be used for login if approved.
        /// Must be unique globally across the system.
        /// </summary>
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores")]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the applicant.
        /// Will be used for login and communication if approved.
        /// Must be unique globally across the system.
        /// </summary>
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number of the applicant.
        /// </summary>
        [Required(ErrorMessage = "Phone number is required")]
        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Password for the requested account.
        /// Will be hashed using BCrypt before storage.
        /// Never stored or returned as plain text.
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [StringLength(255, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$",
            ErrorMessage = "Password must contain uppercase, lowercase, number, and special character")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Name of the gym to be created.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        [Required(ErrorMessage = "Gym name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Gym name must be between 2 and 100 characters")]
        public string GymName { get; set; } = string.Empty;

        /// <summary>
        /// Address of the gym.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        [Required(ErrorMessage = "Gym address is required")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Gym address must be between 5 and 250 characters")]
        public string GymAddress { get; set; } = string.Empty;

        /// <summary>
        /// Phone number for the gym.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        [Required(ErrorMessage = "Gym phone number is required")]
        [StringLength(20, ErrorMessage = "Gym phone number cannot exceed 20 characters")]
        public string GymPhoneNumber { get; set; } = string.Empty;
    }
}
