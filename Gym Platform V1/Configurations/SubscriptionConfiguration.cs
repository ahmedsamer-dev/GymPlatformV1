using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
    {
        public void Configure(EntityTypeBuilder<Subscription> builder)
        {
            // Primary Key
            builder.HasKey(s => s.Id);

            // DateTime properties
            builder.Property(s => s.StartDate)
                .IsRequired();

            builder.Property(s => s.EndDate)
                .IsRequired();

            // Decimal precision for total price
            builder.Property(s => s.TotalPrice)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            // Integer property
            builder.Property(s => s.RemainingSessions)
                .IsRequired();

            // String property with MaxLength
            builder.Property(s => s.Status)
                .HasMaxLength(50)
                .IsRequired();

            // DateTime with default
            builder.Property(s => s.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
