using Gym_Platform_V1.DTOs.Member;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    /// <summary>
    /// Service interface for Member operations.
    /// Responsibility: Handle Member-related business logic.
    /// </summary>
    public interface IMemberService
    {
        /// <summary>
        /// Creates a new Member within a Trainer's Gym.
        /// A Trainer can only create Members in their own Gym.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer's ID</param>
        /// <param name="request">Member creation request with FullName and PhoneNumber</param>
        /// <returns>Created Member response DTO</returns>
        Task<MemberResponseDto> CreateMemberAsync(int trainerId, CreateMemberRequestDto request);
        
    }
}
