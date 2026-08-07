using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    public class MembershipPlanConfiguration : IEntityTypeConfiguration<MembershipPlan>
    {
        public void Configure(EntityTypeBuilder<MembershipPlan> builder)
        {
            // Primary Key
            builder.HasKey(mp => mp.Id);

            // Required Properties with MaxLength
            builder.Property(mp => mp.Name)
                .HasMaxLength(100)
                .IsRequired();

            // Decimal precision for price
            builder.Property(mp => mp.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            // Integer properties
            builder.Property(mp => mp.DurationInDays)
                .IsRequired();

            builder.Property(mp => mp.NumberOfSessions)
                .IsRequired();

            // Boolean property
            builder.Property(mp => mp.IsSessionBased)
                .IsRequired();

            // DateTime with default
            builder.Property(mp => mp.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Multi-Tenant Unique Index (scoped to Gym)
            builder.HasIndex(mp => new { mp.GymId, mp.Name })
                .IsUnique();

            // Relationship
            builder.HasMany(mp => mp.Subscriptions)
                .WithOne(s => s.MembershipPlan)
                .HasForeignKey(s => s.MembershipPlanId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
