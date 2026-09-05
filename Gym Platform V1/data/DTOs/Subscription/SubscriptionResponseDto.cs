using System;
using Gym_Platform_V1.enums;

namespace Gym_Platform_V1.data.DTOs.Subscription
{
    // Frontend-facing view of a Subscription. Never exposes the EF Core Entity directly.
    // MemberName/MembershipPlanName are included for display, following the same
    // convention as TrainerResponseDto.GymName.
    public class SubscriptionResponseDto
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string? MemberName { get; set; }
        public int MembershipPlanId { get; set; }
        public string? MembershipPlanName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
        public int RemainingSessions { get; set; }
        public SubscriptionStatus? Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
