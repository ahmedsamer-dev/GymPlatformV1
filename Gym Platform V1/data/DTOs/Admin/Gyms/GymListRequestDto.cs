using Gym_Platform_V1.data.DTOs.Admin.Common;

namespace Gym_Platform_V1.data.DTOs.Admin.Gyms;

public class GymListRequestDto : PagedRequestDto
{
    public bool? IsActive { get; set; }
    public int? OwnerId { get; set; }
}
