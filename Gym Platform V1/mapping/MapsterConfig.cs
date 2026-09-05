using Gym_Management_System.Entities;
using Gym_Platform_V1.Entities;
using Gym_Platform_V1.data.DTOs.GymOwnerApplication;
using Gym_Platform_V1.data.DTOs.GymOwner;
using Gym_Platform_V1.data.DTOs.Member;
using Gym_Platform_V1.data.DTOs.MembershipPlan;
using Gym_Platform_V1.data.DTOs.Subscription;
using Gym_Platform_V1.data.DTOs.Trainer;
using Mapster;

public static class MapsterConfig
{
    public static void RegisterMappings()
    {
        TypeAdapterConfig<Gym, GymSummaryDto>
            .NewConfig()
            .Map(dest => dest.Name, src => src.Name ?? string.Empty)
            .Map(dest => dest.Address, src => src.Address ?? string.Empty)
            .Map(dest => dest.PhoneNumber, src => src.PhoneNumber ?? string.Empty);

        TypeAdapterConfig<GymOwner, GymOwnerResponseDto>
            .NewConfig();

        TypeAdapterConfig<GymOwnerApplication, GymOwnerApplicationResponseDto>
            .NewConfig();

        TypeAdapterConfig<Trainer, TrainerResponseDto>
            .NewConfig()
            .Map(dest => dest.FullName, src => src.FullName ?? string.Empty)
            .Map(dest => dest.UserName, src => src.UserName ?? string.Empty)
            .Map(dest => dest.PhoneNumber, src => src.PhoneNumber ?? string.Empty)
            .Map(dest => dest.Address, src => src.Address ?? string.Empty)
            .Map(dest => dest.GymName, src => src.Gym == null ? null : src.Gym.Name);

        TypeAdapterConfig<Member, MemberResponseDto>
            .NewConfig()
            .Map(dest => dest.TrainerName, src => src.Trainer == null ? null : src.Trainer.FullName)
            .Map(dest => dest.gymName, src => src.Gym == null ? null : src.Gym.Name);

        TypeAdapterConfig<Member, MemberDetailsResponseDto>
            .NewConfig()
            .Map(dest => dest.TrainerName, src => src.Trainer == null ? null : src.Trainer.FullName)
            .Map(dest => dest.GymName, src => src.Gym == null ? null : src.Gym.Name);

        TypeAdapterConfig<MembershipPlan, MembershipPlanResponseDto>
            .NewConfig();

        TypeAdapterConfig<Subscription, SubscriptionResponseDto>
            .NewConfig()
            .Map(dest => dest.MemberName, src => src.Member == null ? null : src.Member.FullName)
            .Map(dest => dest.MembershipPlanName,
                src => src.MembershipPlan == null ? null : src.MembershipPlan.Name);
    }
}