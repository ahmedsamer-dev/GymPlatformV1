using Gym_Platform_V1.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Platform_V1.Configurations
{
    public class AdminConfiguration : IEntityTypeConfiguration<Admin>
    {
        public void Configure(EntityTypeBuilder<Admin> builder)
        {
            // Primary Key
            builder.HasKey(a => a.Id);

            // Required Properties with MaxLength
            builder.Property(a => a.FullName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.UserName)
                .HasMaxLength(50)
                .IsRequired();
            builder.HasIndex(a => a.UserName)
                .IsUnique();

            builder.Property(a => a.Email)
                .HasMaxLength(150)
                .IsRequired();
            builder.HasIndex(a => a.Email)
                .IsUnique();

            builder.Property(a => a.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();
            builder.HasIndex(a => a.PhoneNumber)
                .IsUnique();

            builder.Property(a => a.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            // DateTime with default
            builder.Property(a => a.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Optional DateTime
            builder.Property(a => a.LastLoginAt)
                .IsRequired(false);

            // Boolean with default
            builder.Property(a => a.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        }
    }
}
