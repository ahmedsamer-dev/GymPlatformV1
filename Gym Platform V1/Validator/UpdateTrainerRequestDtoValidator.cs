using FluentValidation;
using Gym_Platform_V1.DTOs.Trainer;

namespace Gym_Platform_V1.Validator
{
    // Input-level validation only. Ownership and business-rule checks
    // (does the Trainer belong to the Owner? does the Gym belong to the Owner?)
    // remain in the service layer where database context is available.
    internal sealed class UpdateTrainerRequestDtoValidator : AbstractValidator<UpdateTrainerRequestDto>
    {
        public UpdateTrainerRequestDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches("^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");

            RuleFor(x => x.Salary)
                .GreaterThanOrEqualTo(0).WithMessage("Salary must be greater than or equal to 0");

            RuleFor(x => x.Address)
                .MaximumLength(250).WithMessage("Address cannot exceed 250 characters");

            RuleFor(x => x.HireDate)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Hire date cannot be in the future");
        }
    }
}
