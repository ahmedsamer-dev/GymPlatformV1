namespace Gym_Platform_V1.DTOs.Member
{
    /// <summary>
    /// Represents Member details together with the related Trainer and Gym.
    /// </summary>
    public class MemberDetailsResponseDto
    {
        /// <summary>
        /// Gets or sets the Member identifier.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the Member's full name.
        /// </summary>
        public string? FullName { get; set; }

        /// <summary>
        /// Gets or sets the Member's phone number.
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Gets or sets the Member creation time.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the Trainer identifier.
        /// </summary>
        public int TrainerId { get; set; }

        /// <summary>
        /// Gets or sets the Trainer's name.
        /// </summary>
        public string? TrainerName { get; set; }

        /// <summary>
        /// Gets or sets the Gym identifier.
        /// </summary>
        public int GymId { get; set; }

        /// <summary>
        /// Gets or sets the Gym name.
        /// </summary>
        public string? GymName { get; set; }
    }
}
