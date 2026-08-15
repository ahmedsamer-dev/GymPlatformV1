using FluentValidation;
using Gym_Platform_V1.DTOs.GymOwnerApplication;

namespace Gym_Platform_V1.Validator
{
    internal sealed class RejectApplicationRequestDtoValidator : AbstractValidator<RejectApplicationRequestDto>
    {
        public RejectApplicationRequestDtoValidator()
        {
            RuleFor(x => x.RejectionReason)
                .NotEmpty().WithMessage("Rejection reason is required")
                .Length(5, 500).WithMessage("Rejection reason must be between 5 and 500 characters");
        }
    }
}
