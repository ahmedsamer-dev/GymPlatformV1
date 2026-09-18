using FluentValidation;
using Gym_Platform_V1.data.DTOs.Admin.Applications;

namespace Gym_Platform_V1.Validator.admin;

public class ApplicationListRequestDtoValidator : AbstractValidator<ApplicationListRequestDto>
{
    public ApplicationListRequestDtoValidator()
    {
        Include(new PagedRequestDtoValidator());
    }
}
