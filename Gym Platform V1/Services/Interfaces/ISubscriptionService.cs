using Gym_Platform_V1.DTOs.Subscription;

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
    }
}
