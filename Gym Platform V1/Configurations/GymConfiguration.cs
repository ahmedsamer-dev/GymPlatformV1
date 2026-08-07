using Gym_Management_System.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Gym_Management_System.Configurations
    
{
    public class GymConfiguration : IEntityTypeConfiguration<Gym>
    {
        public void Configure(EntityTypeBuilder<Gym> builder)
        {
            // Primary Key
            builder.HasKey(g => g.Id);

            // Required Properties with MaxLength
            builder.Property(g => g.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(g => g.Address)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(g => g.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(g => g.LogoUrl)
                .HasMaxLength(500)
                .IsRequired(false);

            // DateTime with default
            builder.Property(g => g.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationships with delete behavior
            builder.HasMany(g => g.Trainers)
                   .WithOne(t => t.Gym)
                   .HasForeignKey(t => t.GymId)
                   .OnDelete(DeleteBehavior.NoAction);
            builder.HasMany(g => g.Members)
                   .WithOne(m => m.Gym)
                   .HasForeignKey(m => m.GymId)
                   .OnDelete(DeleteBehavior.NoAction);
            builder.HasMany(g => g.MembershipPlans)
                   .WithOne(mp => mp.Gym)
                   .HasForeignKey(mp => mp.GymId)
                   .OnDelete(DeleteBehavior.NoAction);

        }   
    }
}
