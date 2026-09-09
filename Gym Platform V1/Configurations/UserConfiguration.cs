using Gym_Platform_V1.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Platform_V1.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.UserName).HasMaxLength(50).IsRequired();
            builder.Property(u => u.Email).HasMaxLength(150).IsRequired(false);
            builder.Property(u => u.FullName).HasMaxLength(100).IsRequired(false);
            builder.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            builder.Property(u => u.Role).HasMaxLength(30).IsRequired();
            builder.Property(u => u.IsActive).IsRequired();
            builder.HasIndex(u => new { u.Role, u.UserName });
        }
    }
}