using Gym_Platform_V1.DTOs.GymOwnerApplication;

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
    }
}
