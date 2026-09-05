using FluentValidation;
using Gym_Platform_V1.data.DTOs.Auth;

namespace Gym_Platform_V1.Validator.trainer
{
    internal sealed class TrainerLoginRequestDtoValidator : AbstractValidator<TrainerLoginRequestDto>
    {
        public TrainerLoginRequestDtoValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Username is required")
                .Length(3, 50).WithMessage("Username must be between 3 and 50 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .Length(6, 255).WithMessage("Password must be between 6 and 255 characters");
        }
    }
}
