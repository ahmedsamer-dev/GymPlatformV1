using System;

namespace Gym_Management_System.Entities
{
    /// <summary>
    /// Represents a gym managed by a GymOwner.
    /// 
    /// Relationship:
    /// GymOwner 1 ─────── * Gym
    /// - One GymOwner can own multiple Gyms
    /// - Each Gym belongs to exactly one GymOwner
    /// </summary>
    public class Gym
    {
        /// <summary>
        /// Unique identifier for the gym.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name of the gym.
        /// Example: "Ahmed Gym Cairo"
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Physical address of the gym.
        /// </summary>
        public string? Address { get; set; }

        /// <summary>
        /// Contact phone number for the gym.
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Timestamp when the gym was created.
        /// Set automatically by database.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        // ============================================
        // FOREIGN KEY AND NAVIGATION PROPERTY
        // ============================================
        /// <summary>
        /// Foreign key to GymOwner.
        /// Identifies the owner of this gym.
        /// </summary>
        public int GymOwnerID { get; set; }

        /// <summary>
        /// Navigation property to the GymOwner who owns this gym.
        /// </summary>
        public GymOwner? GymOwner { get; set; }

        // ============================================
        // RELATED ENTITIES (BOOKING SYSTEM)
        // ============================================
        /// <summary>
        /// Trainers working at this gym.
        /// </summary>
        public ICollection<Trainer> Trainers { get; set; } = new List<Trainer>();

        /// <summary>
        /// Members enrolled at this gym.
        /// </summary>
        public ICollection<Member> Members { get; set; } = new List<Member>();

        /// <summary>
        /// Membership plans offered by this gym.
        /// </summary>
        public ICollection<MembershipPlan> MembershipPlans { get; set; } = new List<MembershipPlan>();
    }
}
