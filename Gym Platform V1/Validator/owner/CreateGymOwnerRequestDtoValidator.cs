using FluentValidation;
using Gym_Platform_V1.data.DTOs.GymOwner;

namespace Gym_Platform_V1.Validator.owner
{
    internal sealed class CreateGymOwnerRequestDtoValidator : AbstractValidator<CreateGymOwnerRequestDto>
    {
        public CreateGymOwnerRequestDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .Length(3, 100).WithMessage("Full name must be between 3 and 100 characters")
                .Matches("^[a-zA-Z\u0600-\u06FF\\s]+$").WithMessage("Full name must contain letters only");

            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Username is required")
                .Length(3, 50).WithMessage("Username must be between 3 and 50 characters")
                .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(150).WithMessage("Email cannot exceed 150 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$").WithMessage("Password must contain uppercase, lowercase, number and special character");
        }
    }
}
