using System;

namespace Gym_Management_System.Entities
{
    public class MembershipPlan
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public int DurationInDays { get; set; }
        public bool IsSessionBased { get; set; }
        public int NumberOfSessions { get; set; }
        public DateTime CreatedAt { get; set; }
        public int GymId { get; set; }
        public Gym Gym { get; set; }    
        public ICollection<Subscription> Subscriptions { get; set; }
    }
}
