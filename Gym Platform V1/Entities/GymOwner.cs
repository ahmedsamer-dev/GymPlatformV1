using System;

namespace Gym_Management_System.Entities
{
    /// <summary>
    /// Represents an approved gym owner who can use the system.
    /// 
    /// A GymOwner is created by the Admin after approving a GymOwnerApplication.
    /// GymOwner has login credentials (Username/Email + PasswordHash).
    /// 
    /// Relationship:
    /// GymOwner 1 ─────── * Gym
    /// - One GymOwner can own multiple Gyms
    /// - Each Gym belongs to exactly one GymOwner
    /// </summary>
    public class GymOwner
    {
        /// <summary>
        /// Unique identifier for the gym owner.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Full name of the gym owner.
        /// </summary>
        public string? FullName { get; set; }

        /// <summary>
        /// Username used for login.
        /// Must be unique globally.
        /// Supports login: Username + Password
        /// </summary>
        public string? UserName { get; set; }

        /// <summary>
        /// Email address used for login and communication.
        /// Must be unique globally.
        /// Supports login: Email + Password
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Whether the gym owner account is active.
        /// Inactive accounts cannot login.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Phone number for contact.
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// BCrypt-hashed password for authentication.
        /// Used with Username or Email for login.
        /// Never stored or returned as plain text.
        /// </summary>
        public string? PasswordHash { get; set; }

        /// <summary>
        /// Timestamp when the gym owner account was created.
        /// Set automatically by database.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        // ============================================
        // RELATIONSHIPS
        // ============================================
        /// <summary>
        /// Gyms owned by this GymOwner.
        /// A GymOwner can own multiple gyms.
        /// </summary>
        public ICollection<Gym> Gyms { get; set; } = new List<Gym>();
    }
}
