using FluentValidation;
using Gym_Platform_V1.DTOs.Subscription;

namespace Gym_Platform_V1.Validator.subscription
{
    // Input-level validation only. Trainer/Member/Plan relationship checks
    // require database access and stay in the service layer.
    internal sealed class CreateSubscriptionRequestDtoValidator : AbstractValidator<CreateSubscriptionRequestDto>
    {
        public CreateSubscriptionRequestDtoValidator()
        {
            RuleFor(x => x.MemberId)
                .GreaterThan(0).WithMessage("Member ID must be greater than 0");

            RuleFor(x => x.MembershipPlanId)
                .GreaterThan(0).WithMessage("Membership Plan ID must be greater than 0");
        }
    }
}
