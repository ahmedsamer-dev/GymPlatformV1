using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
{
    public class GymOwnerConfiguration : IEntityTypeConfiguration<GymOwner>
    {
        public void Configure(EntityTypeBuilder<GymOwner> builder)
        {

            builder.HasKey(g => g.Id);
            builder.HasMany(g => g.Gyms)
                   .WithOne(gym => gym.GymOwner)
                   .HasForeignKey(g => g.GymOwnerID)
                   .OnDelete(DeleteBehavior.NoAction);
            
            
            builder.Property(g => g.FullName)
                   .HasMaxLength(100)
                   .IsRequired();


            builder.Property(g => g.UserName)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(g => g.UserName)
                .IsUnique();



            builder.Property(g => g.Email)
                .IsRequired()
                .HasMaxLength(150);
            builder.HasIndex(g => g.Email).IsUnique();

            builder.Property(g => g.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);
            builder.HasIndex(g => g.PhoneNumber).IsUnique();

            builder.Property(g => g.PasswordHash)
                .IsRequired()
            .HasMaxLength(255);
            builder.Property(g => g.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            builder.Property(g => g.IsActive)
                .IsRequired()
                .HasDefaultValue(true);


        }
    }
}
