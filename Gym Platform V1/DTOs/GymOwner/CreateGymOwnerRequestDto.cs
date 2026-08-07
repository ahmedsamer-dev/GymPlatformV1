using System.ComponentModel.DataAnnotations;

namespace Gym_Platform_V1.DTOs.GymOwner
{
    /// <summary>
    /// Data Transfer Object for creating a new GymOwner.
    /// Contains all required information for GymOwner registration.
    /// </summary>
    public class CreateGymOwnerRequestDto
    {
        /// <summary>
        /// Gets or sets the full name of the gym owner.
        /// </summary>
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        [RegularExpression(@"^[a-zA-Z\u0600-\u06FF\s]+$",
    ErrorMessage = "Full name must contain letters only.")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the username for login.
        /// Must be globally unique across system.
        /// </summary>
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores.")]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// Must be globally unique across system.
        /// </summary>
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the phone number.
        /// Must be globally unique across system.
        /// </summary>
        [Required(ErrorMessage = "Phone number is required")]
        [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
        [RegularExpression(@"^01[0125][0-9]{8}$",
    ErrorMessage = "Invalid Egyptian phone number.")]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password for authentication.
        /// Will be hashed using BCrypt before storage.
        /// Never stored or returned as plain text.
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [RegularExpression(
    @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$",
    ErrorMessage = "Password must contain uppercase, lowercase, number and special character."
)]
        public string Password { get; set; } = string.Empty;
    }
}
