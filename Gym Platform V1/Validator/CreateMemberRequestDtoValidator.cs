using FluentValidation;
using Gym_Platform_V1.DTOs.Member;

namespace Gym_Platform_V1.Validator
{
    internal sealed class CreateMemberRequestDtoValidator : AbstractValidator<CreateMemberRequestDto>
    {
        public CreateMemberRequestDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");
        }
    }
}
