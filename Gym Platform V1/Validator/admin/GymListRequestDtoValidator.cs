using FluentValidation;
using Gym_Platform_V1.data.DTOs.Admin.Gyms;

namespace Gym_Platform_V1.Validator.admin;

public class GymListRequestDtoValidator : AbstractValidator<GymListRequestDto>
{
    public GymListRequestDtoValidator()
    {
        Include(new PagedRequestDtoValidator());
        RuleFor(x => x.OwnerId).GreaterThan(0).When(x => x.OwnerId.HasValue);
    }
}
