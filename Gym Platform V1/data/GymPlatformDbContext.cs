using Microsoft.EntityFrameworkCore;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Entities;
using Microsoft.Extensions.Options;

namespace Gym_Management_System.Contexts
{
    /// <summary>
    /// Database context for the Gym Platform.
    /// 
    /// Manages all entity models and their configurations.
    /// </summary>
    public class GymPlatformDbContext : DbContext
    {
        public GymPlatformDbContext(DbContextOptions<GymPlatformDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Apply all entity configurations from the assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(GymPlatformDbContext).Assembly);
        }

        // ============================================
        // ADMIN & AUTHENTICATION
        // ============================================
        /// <summary>
        /// Admin users who manage the system.
        /// </summary>
        public DbSet<Admin> Admins { get; set; } = null!;

        // ============================================
        // GYM OWNER APPLICATION & ONBOARDING
        // ============================================
        /// <summary>
        /// Applications from people requesting to become GymOwners.
        /// Independent of GymOwner entity (no FK relationship).
        /// </summary>
        public DbSet<GymOwnerApplication> GymOwnerApplications { get; set; } = null!;

        // ============================================
        // GYM OWNER & GYMS
        // ============================================
        /// <summary>
        /// Approved gym owners who use the system.
        /// </summary>
        public DbSet<GymOwner> GymOwners { get; set; } = null!;

        /// <summary>
        /// Gyms owned by gym owners.
        /// Relationship: GymOwner 1 ─────── * Gym
        /// </summary>
        public DbSet<Gym> Gyms { get; set; } = null!;

        // ============================================
        // BOOKING SYSTEM ENTITIES
        // ============================================
        /// <summary>
        /// Trainers at gyms.
        /// </summary>
        public DbSet<Trainer> Trainers { get; set; } = null!;

        /// <summary>
        /// Members enrolled at gyms.
        /// </summary>
        public DbSet<Member> Members { get; set; } = null!;

        /// <summary>
        /// Membership plans offered by gyms.
        /// </summary>
        public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;

        /// <summary>
        /// Member subscriptions to membership plans.
        /// </summary>
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
    }
}
