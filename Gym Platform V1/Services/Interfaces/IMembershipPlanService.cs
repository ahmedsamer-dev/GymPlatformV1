using Gym_Platform_V1.DTOs.MembershipPlan;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface IMembershipPlanService
    {
        Task<MembershipPlanResponseDto> CreateMembershipPlanAsync(
            int ownerId,
            CreateMembershipPlanRequestDto request);

        // Returns the MembershipPlans belonging to the authenticated GymOwner's Gyms.
        // The authorized Gyms are derived from the JWT ownerId (never client supplied),
        // so an Owner can never see plans from another Owner's Gym.
        Task<List<MembershipPlanResponseDto>> GetPlansForOwnerAsync(int ownerId);

        // Returns the MembershipPlans available in the Gym the authenticated Trainer
        // belongs to. The Gym is derived from the JWT trainerId, never client supplied.
        Task<List<MembershipPlanResponseDto>> GetPlansForTrainerAsync(int trainerId);
    }
}
