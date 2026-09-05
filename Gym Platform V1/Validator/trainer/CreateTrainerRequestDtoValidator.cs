using FluentValidation;
using Gym_Platform_V1.data.DTOs.Trainer;

namespace Gym_Platform_V1.Validator.trainer
{
    internal sealed class CreateTrainerRequestDtoValidator : AbstractValidator<CreateTrainerRequestDto>
    {
        public CreateTrainerRequestDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");

            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Username is required")
                .Length(3, 50).WithMessage("Username must be between 3 and 50 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .Length(6, 255).WithMessage("Password must be between 6 and 255 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");

            RuleFor(x => x.Salary)
                .NotEmpty().WithMessage("Salary is required")
                .GreaterThanOrEqualTo(0).WithMessage("Salary must be greater than or equal to 0");

            RuleFor(x => x.Address)
                .MaximumLength(250).WithMessage("Address cannot exceed 250 characters");

            RuleFor(x => x.HireDate)
                .NotEmpty().WithMessage("Hire date is required")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Hire date cannot be in the future");

            RuleFor(x => x.GymId)
                .GreaterThan(0).WithMessage("Gym ID must be greater than 0");
        }
    }
}
