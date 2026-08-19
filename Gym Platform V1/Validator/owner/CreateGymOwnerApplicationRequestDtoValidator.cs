using FluentValidation;
using Gym_Platform_V1.DTOs.GymOwnerApplication;

namespace Gym_Platform_V1.Validator.owner
{
    internal sealed class CreateGymOwnerApplicationRequestDtoValidator : AbstractValidator<CreateGymOwnerApplicationRequestDto>
    {
        public CreateGymOwnerApplicationRequestDtoValidator()
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
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .Length(8, 100).WithMessage("Password must be between 8 and 100 characters")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$").WithMessage("Password must contain uppercase, lowercase, number, and special character");

            RuleFor(x => x.GymName)
                .NotEmpty().WithMessage("Gym name is required")
                .Length(2, 100).WithMessage("Gym name must be between 2 and 100 characters");

            RuleFor(x => x.GymAddress)
                .NotEmpty().WithMessage("Gym address is required")
                .MaximumLength(250).WithMessage("Gym address cannot exceed 250 characters");

            RuleFor(x => x.GymPhoneNumber)
                .NotEmpty().WithMessage("Gym phone number is required")
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number.");
        }
    }
}
