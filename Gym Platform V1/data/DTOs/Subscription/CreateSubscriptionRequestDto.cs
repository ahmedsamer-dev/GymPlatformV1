namespace Gym_Platform_V1.data.DTOs.Subscription
{
    // The client (Trainer) only chooses WHICH Member gets WHICH existing Plan.
    // TrainerId comes from the JWT; StartDate, EndDate, TotalPrice, RemainingSessions,
    // Status, and CreatedAt are all calculated/controlled by the server.
    public class CreateSubscriptionRequestDto
    {
        public int MemberId { get; set; }
        public int MembershipPlanId { get; set; }
    }
}
