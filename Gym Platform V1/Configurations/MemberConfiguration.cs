using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    public class MemberConfiguration : IEntityTypeConfiguration<Member>
    {
        public void Configure(EntityTypeBuilder<Member> builder)
        {
            // Primary Key
            builder.HasKey(m => m.Id);

            // Required Properties with MaxLength
            builder.Property(m => m.FullName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(m => m.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            // DateTime with default
            builder.Property(m => m.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Multi-Tenant Unique Index (scoped to Gym)
            builder.HasIndex(m => new { m.GymId, m.PhoneNumber })
                .IsUnique();

            // Relationship
            builder.HasMany(m => m.Subscriptions)
                .WithOne(s => s.Member)
                .HasForeignKey(s => s.MemberId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
