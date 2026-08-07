using System;

namespace Gym_Management_System.Entities
{
    public class Member
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public int GymId { get; set; }
        public int TrainerId { get; set; }
        public Gym? Gym { get; set; }
        public Trainer? Trainer { get; set; }
       public ICollection<Subscription> Subscriptions { get; set; }
    }
}
