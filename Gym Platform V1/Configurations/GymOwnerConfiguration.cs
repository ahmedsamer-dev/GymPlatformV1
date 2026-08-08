using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    /// <summary>
    /// EF Core configuration for GymOwner entity.
    /// 
    /// A GymOwner is an approved person who can use the system.
    /// 
    /// Relationship: GymOwner 1 ─────── * Gym
    /// - One GymOwner can own multiple Gyms
    /// - Each Gym belongs to exactly one GymOwner
    /// </summary>
    public class GymOwnerConfiguration : IEntityTypeConfiguration<GymOwner>
    {
        public void Configure(EntityTypeBuilder<GymOwner> builder)
        {
            // ============================================
            // PRIMARY KEY
            // ============================================
            builder.HasKey(g => g.Id);

            // ============================================
            // REQUIRED PROPERTIES WITH MAX LENGTH
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
            // STATUS FLAGS
            // ============================================
            builder.Property(g => g.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // ============================================
            // TIMESTAMPS
            // ============================================
            builder.Property(g => g.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // ============================================
            // RELATIONSHIP: GYMOWNER → GYMS
            // ============================================
            // GymOwner 1 ─────── * Gym
            // One GymOwner can have multiple Gyms
            // When a GymOwner is created, Gyms can be created
            // When attempting to delete a GymOwner with Gyms, use NoAction (prevent deletion)
            builder.HasMany(g => g.Gyms)
                   .WithOne(gym => gym.GymOwner)
                   .HasForeignKey(g => g.GymOwnerID)
                   .OnDelete(DeleteBehavior.NoAction);

            // ============================================
            // UNIQUE CONSTRAINTS FOR LOGIN
            // ============================================
            // Username must be unique (login via Username + Password)
            builder.HasIndex(g => g.UserName)
                .IsUnique()
                .HasDatabaseName("IX_GymOwner_UserName_Unique");

            // Email must be unique (login via Email + Password, and communication)
            builder.HasIndex(g => g.Email)
                .IsUnique()
                .HasDatabaseName("IX_GymOwner_Email_Unique");

            // PhoneNumber should also be unique if business requires
            builder.HasIndex(g => g.PhoneNumber)
                .IsUnique()
                .HasDatabaseName("IX_GymOwner_PhoneNumber_Unique");

            // ============================================
            // ADDITIONAL INDEXES FOR PERFORMANCE
            // ============================================
            // Index on IsActive for filtering active owners
            builder.HasIndex(g => g.IsActive)
                .HasDatabaseName("IX_GymOwner_IsActive");

            // Index on CreatedAt for sorting by registration date
            builder.HasIndex(g => g.CreatedAt)
                .HasDatabaseName("IX_GymOwner_CreatedAt");
        }
    }
}
