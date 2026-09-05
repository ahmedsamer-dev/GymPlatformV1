using Gym_Platform_V1.data.DTOs.GymOwner;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    /// <summary>
    /// Service interface for GymOwner business operations.
    /// Defines contract for GymOwner creation and management.
    /// Enables dependency injection and testability.
    /// </summary>
    public interface IGymOwnerService
    {
        /// <summary>
        /// Returns the Gyms belonging to the authenticated GymOwner.
        /// ownerId is extracted from JWT — never accepted from the client.
        /// Returns an empty list when the Owner has no Gyms.
        /// </summary>
        /// <param name="ownerId">The authenticated Owner's id from JWT</param>
        Task<List<GymSummaryDto>> GetGymsForOwnerAsync(int ownerId);

        /// <summary>
        /// Creates a new GymOwner with the provided details.
        /// 
        /// Responsibilities:
        /// - Validate input data (DTOs validation already done by controller)
        /// - Check business rules (uniqueness of username, email, phone)
        /// - Hash password using BCrypt
        /// - Create and persist GymOwner entity
        /// - Return created GymOwner details (without password)
        /// - Handle and log errors appropriately
        /// 
        /// Authorization:
        /// - Only callable by Admin users (enforced by controller)
        /// 
        /// Database Constraints (Safety Net):
        /// - Username global unique index
        /// - Email global unique index
        /// - PhoneNumber global unique index
        /// - IsActive defaults to true
        /// - CreatedAt set by database (GETUTCDATE())
        /// </summary>
        /// <param name="request">CreateGymOwnerRequestDto with gym owner details</param>
        /// <returns>
        /// Task containing ApiResult with GymOwnerResponseDto on success,
        /// or error details on failure
        /// </returns>
        /// <exception cref="ArgumentNullException">Thrown if request is null</exception>
        /// <exception cref="InvalidOperationException">Thrown for business rule violations</exception>
        Task<GymOwnerResponseDto> CreateAsync(CreateGymOwnerRequestDto request);

        /// <summary>
        /// Retrieves a GymOwner by their unique identifier.
        /// 
        /// Responsibilities:
        /// - Validate input id (id must be > 0)
        /// - Query database for GymOwner with matching Id
        /// - Use AsNoTracking() for read-only operation
        /// - Return null if GymOwner not found
        /// - Map Entity to GymOwnerResponseDto manually
        /// - Do not modify database
        /// 
        /// Authorization:
        /// - Only callable by Admin users (enforced by controller)
        /// </summary>
        /// <param name="id">The unique identifier of the GymOwner to retrieve</param>
        /// <returns>
        /// Task containing GymOwnerResponseDto if found,
        /// or null if GymOwner does not exist or id is invalid
        /// </returns>
        Task<GymOwnerDetailsDto?> GetByIdAsync(int id);
        Task<IEnumerable<GymOwnerResponseDto>> GetAllAsync();
    }
}
