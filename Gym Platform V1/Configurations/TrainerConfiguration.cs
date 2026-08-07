using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    public class TrainerConfiguration : IEntityTypeConfiguration<Trainer>
    {
        public void Configure(EntityTypeBuilder<Trainer> builder)
        {
            // Primary Key
            builder.HasKey(t => t.Id);

            // Required Properties with MaxLength
            builder.Property(t => t.FullName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(t => t.UserName)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(t => t.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(t => t.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(t => t.Address)
                .HasMaxLength(250)
                .IsRequired(false);

            builder.Property(t => t.ImageUrl)
                .HasMaxLength(500)
                .IsRequired(false);

            // Decimal precision for salary
            builder.Property(t => t.Salary)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            // DateTime properties
            builder.Property(t => t.HireDate)
                .IsRequired();

            builder.Property(t => t.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Boolean with default
            builder.Property(t => t.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Multi-Tenant Unique Indexes (scoped to Gym)
            builder.HasIndex(t => new { t.GymId, t.UserName })
                .IsUnique();

            builder.HasIndex(t => new { t.GymId, t.PhoneNumber })
                .IsUnique();

            // Relationship
            builder.HasMany(t => t.Members)
                   .WithOne(member => member.Trainer)
                   .HasForeignKey(member => member.TrainerId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
