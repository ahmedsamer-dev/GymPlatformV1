using Gym_Platform_V1.data.DTOs.Member;

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

        /// <summary>
        /// Retrieves a Member only when the Member belongs to the specified Trainer.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier</param>
        /// <param name="memberId">The Member identifier</param>
        /// <returns>Member details, or null when the Member is not accessible</returns>
        Task<MemberDetailsResponseDto?> GetMemberByIdForTrainerAsync(int trainerId, int memberId);

        /// <summary>
        /// Retrieves a Member only when the Member belongs to a Gym owned by the specified GymOwner.
        /// </summary>
        /// <param name="ownerId">The authenticated GymOwner identifier</param>
        /// <param name="memberId">The Member identifier</param>
        /// <returns>Member details, or null when the Member is not accessible</returns>
        Task<MemberDetailsResponseDto?> GetMemberByIdForOwnerAsync(int ownerId, int memberId);

        /// <summary>
        /// Updates the basic information (FullName, PhoneNumber) of a Member
        /// that belongs to the specified Trainer. The Member stays associated
        /// with the same Trainer and Gym; no other field is modified.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier from JWT claims</param>
        /// <param name="memberId">The Member identifier from the route</param>
        /// <param name="request">Update request with FullName and PhoneNumber</param>
        /// <returns>The updated Member details</returns>
        Task<MemberDetailsResponseDto> UpdateMemberAsync(int trainerId, int memberId, UpdateMemberRequestDto request);

        /// <summary>
        /// Retrieves the Members that belong to the specified Trainer.
        /// The Members are always filtered by TrainerId so a Trainer can only
        /// ever see their own Members, never those of another Trainer.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier from JWT claims</param>
        /// <param name="request">Optional search filters (Name, Phone)</param>
        /// <returns>The list of the Trainer's Members</returns>
        Task<List<MemberResponseDto>> GetMyMembersAsync(int trainerId, MemberSearchRequestDto request);

    }
}
