using System;

namespace Gym_Management_System.Entities
{
    public class Gym
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public int GymOwnerID { get; set; }
        public GymOwner? GymOwner { get; set; }
        public ICollection<Trainer> Trainers { get; set; }
        public ICollection<Member> Members { get; set; }
       public ICollection<MembershipPlan> MembershipPlans { get; set; }
    }
}
