using System;

namespace Gym_Platform_V1.DTOs.MembershipPlan
{
    // Represents a MembershipPlan after creation. Never exposes the Entity directly.
    public class MembershipPlanResponseDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public int DurationInDays { get; set; }
        public bool IsSessionBased { get; set; }
        public int NumberOfSessions { get; set; }
        public int GymId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
