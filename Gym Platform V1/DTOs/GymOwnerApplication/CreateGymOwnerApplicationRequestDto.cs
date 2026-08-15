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
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Username requested by the applicant.
        /// Will be used for login if approved.
        /// Must be unique globally across the system.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the applicant.
        /// Will be used for login and communication if approved.
        /// Must be unique globally across the system.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number of the applicant.
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Password for the requested account.
        /// Will be hashed using BCrypt before storage.
        /// Never stored or returned as plain text.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Name of the gym to be created.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        public string GymName { get; set; } = string.Empty;

        /// <summary>
        /// Address of the gym.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        public string GymAddress { get; set; } = string.Empty;

        /// <summary>
        /// Phone number for the gym.
        /// Used when the application is approved to create the Gym entity.
        /// </summary>
        public string GymPhoneNumber { get; set; } = string.Empty;
    }
}
