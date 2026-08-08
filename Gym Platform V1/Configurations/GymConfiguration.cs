using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    /// <summary>
    /// EF Core configuration for Gym entity.
    /// 
    /// Relationship: GymOwner 1 ─────── * Gym
    /// </summary>
    public class GymConfiguration : IEntityTypeConfiguration<Gym>
    {
        public void Configure(EntityTypeBuilder<Gym> builder)
        {
            // Primary Key
            builder.HasKey(g => g.Id);

            // ============================================
            // REQUIRED PROPERTIES WITH MAX LENGTH
            // ============================================
            builder.Property(g => g.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(g => g.Address)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(g => g.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            // ============================================
            // TIMESTAMPS
            // ============================================
            builder.Property(g => g.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // ============================================
            // FOREIGN KEY CONFIGURATION
            // ============================================
            // GymOwner 1 ─────── * Gym
            // One GymOwner can have many Gyms
            // Each Gym belongs to one GymOwner
            // Cascade is prevented - cannot delete owner with gyms
            builder.HasOne(g => g.GymOwner)
                   .WithMany(o => o.Gyms)
                   .HasForeignKey(g => g.GymOwnerID)
                   .OnDelete(DeleteBehavior.NoAction);

            // ============================================
            // RELATED ENTITY RELATIONSHIPS
            // ============================================
            // Trainers at this gym
            builder.HasMany(g => g.Trainers)
                   .WithOne(t => t.Gym)
                   .HasForeignKey(t => t.GymId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Members at this gym
            builder.HasMany(g => g.Members)
                   .WithOne(m => m.Gym)
                   .HasForeignKey(m => m.GymId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Membership plans for this gym
            builder.HasMany(g => g.MembershipPlans)
                   .WithOne(mp => mp.Gym)
                   .HasForeignKey(mp => mp.GymId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
