using Gym_Platform_V1.Entities;
using Gym_Platform_V1.enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Platform_V1.Configurations
{
    /// <summary>
    /// EF Core configuration for GymOwnerApplication entity.
    /// 
    /// Important: GymOwnerApplication is NOT related to GymOwner.
    /// This is an independent request/application entity.
    /// 
    /// After Admin approval, separate entities (GymOwner and Gym) will be created.
    /// </summary>
    public class GymOwnerApplicationConfiguration : IEntityTypeConfiguration<GymOwnerApplication>
    {
        public void Configure(EntityTypeBuilder<GymOwnerApplication> builder)
        {
            // ============================================
            // PRIMARY KEY
            // ============================================
            builder.HasKey(g => g.Id);

            // ============================================
            // APPLICANT INFORMATION
            // ============================================
            builder.Property(g => g.FullName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(g => g.UserName)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(g => g.Email)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(g => g.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(g => g.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            // ============================================
            // GYM INFORMATION
            // ============================================
            builder.Property(g => g.GymName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(g => g.GymAddress)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(g => g.GymPhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            // ============================================
            // APPLICATION WORKFLOW
            // ============================================
            builder.Property(g => g.Status)
                .HasConversion<int>()
                .IsRequired()
                .HasDefaultValue(ApplicationStatus.Pending);

            builder.Property(g => g.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(g => g.ReviewedAt)
                .IsRequired(false);

            builder.Property(g => g.RejectionReason)
                .HasMaxLength(500)
                .IsRequired(false);

            // ============================================
            // INDEXES FOR PERFORMANCE & BUSINESS RULES
            // ============================================
            // Unique Username (when approved, this will be used)
            // For now, track it to prevent duplicates during application process
            builder.HasIndex(g => g.UserName)
                .IsUnique()
                .HasDatabaseName("IX_GymOwnerApplication_UserName_Unique");

            // Unique Email (when approved, this will be used)
            // For now, track it to prevent duplicates during application process
            builder.HasIndex(g => g.Email)
                .IsUnique()
                .HasDatabaseName("IX_GymOwnerApplication_Email_Unique");

            // Index on Status for quick lookups (Admin reviewing applications)
            builder.HasIndex(g => g.Status)
                .HasDatabaseName("IX_GymOwnerApplication_Status");

            // Index on CreatedAt for sorting/filtering by submission date
            builder.HasIndex(g => g.CreatedAt)
                .HasDatabaseName("IX_GymOwnerApplication_CreatedAt");

            // ============================================
            // IMPORTANT: NO RELATIONSHIP TO GYMOWNER
            // ============================================
            // GymOwnerApplication is independent.
            // No FK to GymOwner.
            // No navigation property.
            // The entity exists to store the application request.
            // After approval, Admin service creates GymOwner and Gym separately.
        }
    }
}
