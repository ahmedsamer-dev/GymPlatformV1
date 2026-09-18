using FluentValidation;
using Gym_Platform_V1.data.DTOs.Admin.Owners;

namespace Gym_Platform_V1.Validator.admin;

public class OwnerListRequestDtoValidator : AbstractValidator<OwnerListRequestDto>
{
    public OwnerListRequestDtoValidator()
    {
        Include(new PagedRequestDtoValidator());
    }
}
