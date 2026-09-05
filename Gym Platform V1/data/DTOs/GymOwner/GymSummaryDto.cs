namespace Gym_Platform_V1.data.DTOs.GymOwner
{
    /// <summary>
    /// Data Transfer Object for summarized Gym information.
    /// 
    /// Used when returning Gym details as part of GymOwnerDetailsDto.
    /// Contains only basic Gym information needed by Admin dashboard.
    /// 
    /// Excludes:
    /// - Members
    /// - Trainers
    /// - MembershipPlans
    /// - Subscriptions
    /// - LogoUrl
    /// - other unnecessary details
    /// </summary>
    public class GymSummaryDto
    {
        /// <summary>
        /// Unique identifier for the gym.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name of the gym.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Physical address of the gym.
        /// </summary>
        public string Address { get; set; } = string.Empty;

        /// <summary>
        /// Contact phone number for the gym.
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when the gym was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
