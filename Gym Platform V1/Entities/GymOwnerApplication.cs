using System.ComponentModel.DataAnnotations;
using Gym_Platform_V1.enums;

namespace Gym_Platform_V1.Entities
{
    /// <summary>
    /// Represents an application from a person requesting to become a GymOwner.
    /// 
    /// Important: This entity is independent of GymOwner.
    /// The applicant is NOT a GymOwner until the Admin approves the application.
    /// No foreign key relationship exists to GymOwner.
    /// 
    /// After approval, the Admin service will:
    /// 1. Create a GymOwner entity
    /// 2. Create a Gym entity
    /// 3. Link the Gym to the GymOwner
    /// 
    /// This application serves as a request form and audit trail.
    /// </summary>
    public class GymOwnerApplication
    {
        /// <summary>
        /// Unique identifier for the application.
        /// </summary>
        public int Id { get; set; }

        // ============================================
        // APPLICANT INFORMATION
        // ============================================
        /// <summary>
        /// Full name of the person requesting to become a GymOwner.
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the applicant.
        /// Will be used as login credential if approved.
        /// </summary>
        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number of the applicant.
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Username requested by the applicant.
        /// Will be used as login credential if approved.
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// BCrypt-hashed password for the requested account.
        /// Must be hashed before storage.
        /// Never stored or returned as plain text.
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        // ============================================
        // GYM BASIC INFORMATION
        // ============================================
        /// <summary>
        /// Name of the gym the applicant wants to create.
        /// Will be used to create the Gym entity if approved.
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string GymName { get; set; } = string.Empty;

        /// <summary>
        /// Address of the gym.
        /// </summary>
        [Required]
        [MaxLength(250)]
        public string GymAddress { get; set; } = string.Empty;

        /// <summary>
        /// Phone number for the gym.
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string GymPhoneNumber { get; set; } = string.Empty;

        // ============================================
        // APPLICATION WORKFLOW
        // ============================================
        /// <summary>
        /// Current status of the application.
        /// Possible values: Pending, Approved, Rejected
        /// </summary>
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        /// <summary>
        /// Timestamp when the application was submitted.
        /// Set automatically by database.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Timestamp when the application was reviewed (approved or rejected).
        /// Null while application is pending.
        /// </summary>
        public DateTime? ReviewedAt { get; set; }

        /// <summary>
        /// Reason for rejection if Status is Rejected.
        /// Null if application is Pending or Approved.
        /// </summary>
        public string? RejectionReason { get; set; }
    }
}