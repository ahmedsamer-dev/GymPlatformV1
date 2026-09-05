using FluentValidation;
using Gym_Platform_V1.data.DTOs.MembershipPlan;

namespace Gym_Platform_V1.Validator.membership
{
    // Input-level validation only. Ownership checks (does the Gym belong to the Owner?)
    // require database access and remain in the service layer.
    internal sealed class CreateMembershipPlanRequestDtoValidator : AbstractValidator<CreateMembershipPlanRequestDto>
    {
        public CreateMembershipPlanRequestDtoValidator()
        {
            RuleFor(x => x.GymId)
                .GreaterThan(0).WithMessage("Gym ID must be greater than 0");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Plan name is required")
                .MaximumLength(100).WithMessage("Plan name cannot exceed 100 characters");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0");

            RuleFor(x => x.DurationInDays)
                .GreaterThan(0).WithMessage("Duration must be greater than 0 days");

            // Session-based plans must define a positive session count...
            RuleFor(x => x.NumberOfSessions)
                .GreaterThan(0).WithMessage("Number of sessions must be greater than 0 for session-based plans")
                .When(x => x.IsSessionBased);

            // ...while time-based plans must not carry a session count.
            RuleFor(x => x.NumberOfSessions)
                .Equal(0).WithMessage("Number of sessions must be 0 for time-based plans")
                .When(x => !x.IsSessionBased);
        }
    }
}
