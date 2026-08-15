namespace Gym_Platform_V1.DTOs.Auth
{
    /// <summary>
    /// Data Transfer Object for Admin login request.
    /// Used for request validation and model binding.
    /// </summary>
    public class AdminLoginRequestDto
    {
        /// <summary>
        /// Gets or sets the Admin username.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the Admin password.
        /// </summary>
        public string Password { get; set; } = string.Empty;
    }
}
