using System.ComponentModel.DataAnnotations;

namespace Gym_Platform_V1.DTOs.Auth
{
    /// <summary>
    /// Data Transfer Object for Trainer login request.
    /// Used for request validation and model binding.
    /// </summary>
    public class TrainerLoginRequestDto
    {
        /// <summary>
        /// Gets or sets the Trainer username.
        /// </summary>
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the Trainer password.
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [StringLength(255, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 255 characters")]
        public string Password { get; set; } = string.Empty;
    }
}
