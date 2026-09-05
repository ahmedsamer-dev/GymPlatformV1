namespace Gym_Platform_V1.data.DTOs.Auth
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
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the Trainer password.
        /// </summary>
        public string Password { get; set; } = string.Empty;
    }
}
