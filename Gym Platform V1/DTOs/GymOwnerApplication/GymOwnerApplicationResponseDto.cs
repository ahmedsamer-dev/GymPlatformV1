using Gym_Platform_V1.enums;

namespace Gym_Platform_V1.DTOs.GymOwnerApplication
{
    /// <summary>
    /// Data Transfer Object for GymOwnerApplication response.
    /// 
    /// This DTO is returned when:
    /// 1. Applicant submits an application (see their application)
    /// 2. Admin reviews applications (see all applications)
    /// 3. Admin checks specific application details
    /// 
    /// Contains all information the Admin needs for review and decision.
    /// 
    /// Excludes:
    /// - Password
    /// - PasswordHash (never exposed to client)
    /// - any sensitive authentication data
    /// </summary>
    public class GymOwnerApplicationResponseDto
    {
        /// <summary>
        /// Unique identifier for the application.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Full name of the applicant.
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Username requested by the applicant.
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the applicant.
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Phone number of the applicant.
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Name of the gym the applicant wants to create.
        /// </summary>
        public string GymName { get; set; } = string.Empty;

        /// <summary>
        /// Address of the gym.
        /// </summary>
        public string GymAddress { get; set; } = string.Empty;

        /// <summary>
        /// Phone number for the gym.
        /// </summary>
        public string GymPhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Current status of the application.
        /// Possible values: Pending, Approved, Rejected
        /// </summary>
        public ApplicationStatus Status { get; set; }

        /// <summary>
        /// Timestamp when the application was submitted.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Timestamp when the application was reviewed (approved or rejected).
        /// Null if application is still pending.
        /// </summary>
        public DateTime? ReviewedAt { get; set; }

        /// <summary>
        /// Reason for rejection if Status is Rejected.
        /// Null if application is Pending or Approved.
        /// </summary>
        public string? RejectionReason { get; set; }
    }
}
