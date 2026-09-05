using Gym_Management_System.Entities;
using Gym_Platform_V1.data.DTOs.Subscription;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface ISubscriptionService
    {
        Task<SubscriptionResponseDto> CreateSubscriptionAsync(
            int trainerId,
            CreateSubscriptionRequestDto request);

        Task<SubscriptionResponseDto> UseSessionAsync(
            int trainerId,
            int subscriptionId);

        // Returns the Subscriptions belonging to the authenticated Trainer's Members.
        // The ownership condition (Subscription.Member.TrainerId == trainerId) is applied
        // in the database query, so a Trainer can never see another Trainer's subscriptions.
        Task<List<SubscriptionResponseDto>> GetMySubscriptionsAsync(int trainerId);

        // Builds (WITHOUT saving) a Subscription for a Member that already belongs to the
        // authenticated Trainer, using a MembershipPlan from the Trainer's Gym.
        // All ownership/active-subscription validations live here so they are shared with
        // CreateSubscriptionAsync. The caller (MemberService) adds the returned entity to the
        // shared DbContext and saves it inside the same transaction as the Member creation,
        // keeping the "create Member + first Subscription" operation atomic.
        Task<Subscription> BuildSubscriptionForMemberAsync(
            int trainerId,
            Member member,
            int membershipPlanId);
    }
}
