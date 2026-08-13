namespace Gym_Platform_V1.DTOs.Member
{
    /// <summary>
    /// Data Transfer Object for Member creation response.
    /// Contains the created Member's information.
    /// </summary>
    public class MemberResponseDto
    {
        /// <summary>
        /// Gets or sets the Member's unique identifier.
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
        /// Gets or sets the Gym ID this Member belongs to.
        /// </summary>
        public int GymId { get; set; }

        /// <summary>
        /// Gets or sets the Trainer ID who created this Member.
        /// </summary>
        public int TrainerId { get; set; }

        /// <summary>
        /// Gets or sets the Trainer's full name (for reference).
        /// </summary>
        public string? TrainerName { get; set; }

        /// <summary>
        /// Gets or sets the creation timestamp.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
