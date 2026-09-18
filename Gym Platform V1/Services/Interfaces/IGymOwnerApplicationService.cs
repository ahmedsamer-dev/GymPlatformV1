using Gym_Platform_V1.data.DTOs.GymOwnerApplication;
using Gym_Platform_V1.data.DTOs.Admin.Applications;
using Gym_Platform_V1.data.DTOs.Admin.Common;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface IGymOwnerApplicationService
    {
        Task<GymOwnerApplicationResponseDto> SubmitApplicationAsync(
            CreateGymOwnerApplicationRequestDto request);

        Task<IEnumerable<GymOwnerApplicationResponseDto>> GetApplicationsAsync();

        Task ApproveApplicationAsync(int applicationId);

        Task RejectApplicationAsync(
            int applicationId,
            string rejectionReason);
        Task<IEnumerable<GymOwnerApplicationResponseDto>> GetPendingApplicationsAsync();

        Task<PagedResponseDto<ApplicationListResponseDto>> GetPagedApplicationsAsync(ApplicationListRequestDto request);

        Task<GymOwnerApplicationResponseDto?> GetByIdForAdminAsync(int applicationId);
    }
}
