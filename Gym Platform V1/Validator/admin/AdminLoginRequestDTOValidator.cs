using FluentValidation;
using Gym_Platform_V1.DTOs.Auth;

namespace Gym_Platform_V1.Validator.admin
{
    internal sealed class AdminLoginRequestDtoValidator : AbstractValidator<AdminLoginRequestDto>
    {
        public AdminLoginRequestDtoValidator()
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
