using Microsoft.EntityFrameworkCore;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Entities;
using Microsoft.Extensions.Options;

namespace Gym_Management_System.Contexts
{
    public class GymPlatformDbContext : DbContext
    {


        public GymPlatformDbContext(DbContextOptions<GymPlatformDbContext> options) : base(options)
        {
            
        }
        override protected void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(GymPlatformDbContext).Assembly);
        }
     

        public DbSet<Admin> Admins { get; set; } = null!;
        public DbSet<GymOwner> GymOwners { get; set; } = null!;
        public DbSet<Gym> Gyms { get; set; } = null!;
        public DbSet<Trainer> Trainers { get; set; } = null!;
        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
    }
}
