using FluentValidation;
using Gym_Platform_V1.data.DTOs.Admin.Common;

namespace Gym_Platform_V1.Validator.admin;

public class PagedRequestDtoValidator : AbstractValidator<PagedRequestDto>
{
    public PagedRequestDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.Search)
            .MaximumLength(150)
            .When(x => x.Search is not null);

        RuleFor(x => x.SortDirection)
            .Must(value => string.IsNullOrWhiteSpace(value) || value.Equals("asc", StringComparison.OrdinalIgnoreCase) || value.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("SortDirection must be 'asc' or 'desc'.");
    }
}
