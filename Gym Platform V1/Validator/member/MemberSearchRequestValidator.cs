using FluentValidation;
using Gym_Platform_V1.data.DTOs.Member;

namespace Gym_Platform_V1.Validator.member
{
    internal sealed class MemberSearchRequestValidator : AbstractValidator<MemberSearchRequestDto>
    {
        public MemberSearchRequestValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Name));

            RuleFor(x => x.Phone)
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone));
        }
    }
}
