using Gym_Platform_V1.DTOs.MembershipPlan;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface IMembershipPlanService
    {
        Task<MembershipPlanResponseDto> CreateMembershipPlanAsync(
            int ownerId,
            CreateMembershipPlanRequestDto request);
    }
}
