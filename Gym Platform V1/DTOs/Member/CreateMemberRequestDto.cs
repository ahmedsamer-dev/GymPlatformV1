namespace Gym_Platform_V1.DTOs.Member
{
    public class CreateMemberRequestDto
    {
        public string FullName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        // Optional. When provided, the backend creates the Member AND their first
        // Subscription (for the selected plan) as one atomic operation.
        // TrainerId/GymId are NEVER taken from here — they come from the JWT.
        public int? MembershipPlanId { get; set; }
    }
}
