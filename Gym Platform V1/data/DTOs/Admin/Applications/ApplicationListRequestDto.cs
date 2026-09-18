using Gym_Platform_V1.data.DTOs.Admin.Common;
using Gym_Platform_V1.enums;

namespace Gym_Platform_V1.data.DTOs.Admin.Applications;

public class ApplicationListRequestDto : PagedRequestDto
{
    public ApplicationStatus? Status { get; set; }
}
