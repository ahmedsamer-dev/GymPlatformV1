using Gym_Platform_V1.data.DTOs.Admin.Common;

namespace Gym_Platform_V1.data.DTOs.Admin.Owners;

public class OwnerListRequestDto : PagedRequestDto
{
    public bool? IsActive { get; set; }
}
