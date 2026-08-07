using Gym_Platform_V1.enums;
using System;

namespace Gym_Management_System.Entities
{
    public class Subscription
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
        public int RemainingSessions { get; set; }
        public SubscriptionStatus? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MemberId { get; set; }
        public int MembershipPlanId { get; set; }
        public Member? Member { get; set; }
        public MembershipPlan? MembershipPlan { get; set; }
    }
}
