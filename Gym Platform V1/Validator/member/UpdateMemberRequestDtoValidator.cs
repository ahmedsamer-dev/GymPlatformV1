using FluentValidation;
using Gym_Platform_V1.data.DTOs.Member;

namespace Gym_Platform_V1.Validator.member
{
    internal sealed class UpdateMemberRequestDtoValidator : AbstractValidator<UpdateMemberRequestDto>
    {
        public UpdateMemberRequestDtoValidator()
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
