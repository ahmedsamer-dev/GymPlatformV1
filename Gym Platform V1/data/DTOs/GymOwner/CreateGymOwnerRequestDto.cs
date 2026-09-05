namespace Gym_Platform_V1.data.DTOs.GymOwner
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
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the username for login.
        /// Must be globally unique across system.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// Must be globally unique across system.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the phone number.
        /// Must be globally unique across system.
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password for authentication.
        /// Will be hashed using BCrypt before storage.
        /// Never stored or returned as plain text.
        /// </summary>
        public string Password { get; set; } = string.Empty;
    }
}
