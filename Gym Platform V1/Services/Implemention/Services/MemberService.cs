using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.data.DTOs.Member;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Service implementation for Member operations.
    /// Responsibility: Handle Member creation with Trainer context validation.
    /// </summary>
    public class MemberService : IMemberService
    {
        private readonly ILogger<MemberService> _logger;
        private readonly GymPlatformDbContext _context;
        private readonly ISubscriptionService _subscriptionService;

        public MemberService(
            ILogger<MemberService> logger,
            GymPlatformDbContext context,
            ISubscriptionService subscriptionService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
        }

        /// <summary>
        /// Creates a new Member within the authenticated Trainer's Gym.
        /// A Trainer can only create Members in their own Gym.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer's ID from JWT claims</param>
        /// <param name="request">Member creation request with FullName, PhoneNumber and optional MembershipPlanId</param>
        /// <returns>Created Member response DTO</returns>
        public async Task<MemberResponseDto> CreateMemberAsync(int trainerId, CreateMemberRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation("Creating Member for Trainer: {TrainerId}", trainerId);

            // Load the Trainer (read-only) to derive the Gym. TrainerId comes from the JWT,
            // never from the request body.
            var trainer = await _context.Trainers
                .AsNoTracking()
                .Include(t => t.Gym)
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            // Verify Trainer is active
            if (!trainer.IsActive)
            {
                _logger.LogWarning("Attempt to create Member for inactive Trainer: {TrainerId}", trainerId);
                throw new InvalidOperationException("Cannot create Member for an inactive Trainer.");
            }

            // Duplicate phone check — scoped to the Trainer's Gym to match the existing
            // unique index on (GymId, PhoneNumber). Enforced here for a friendly error;
            // the index is the real guarantee against race conditions.
            var phoneExists = await _context.Members
                .AsNoTracking()
                .AnyAsync(m => m.PhoneNumber == request.PhoneNumber && m.GymId == trainer.GymId);

            if (phoneExists)
            {
                _logger.LogWarning(
                    "Attempt to create Member with existing phone number: {PhoneNumber} in GymId: {GymId}",
                    request.PhoneNumber, trainer.GymId);

                throw new InvalidOperationException(
                    "A member with this phone number already exists.");
            }

            // Create Member with Trainer's GymId and TrainerId (both derived from JWT Trainer,
            // never from the request body).
            var member = new Member
            {
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                TrainerId = trainerId,
                GymId = trainer.GymId
            };

            // If a MembershipPlan was selected, build the first Subscription. Plan existence
            // and Gym ownership are validated inside the shared SubscriptionService logic.
            // The entity is NOT saved here — it is persisted with the Member in one transaction.
            Subscription? subscription = null;
            if (request.MembershipPlanId.HasValue)
            {
                _logger.LogInformation(
                    "MembershipPlan {MembershipPlanId} selected while creating Member for Trainer: {TrainerId}",
                    request.MembershipPlanId.Value, trainerId);

                subscription = await _subscriptionService.BuildSubscriptionForMemberAsync(
                    trainerId, member, request.MembershipPlanId.Value);
            }

            // Atomic persistence: Member (+ optional first Subscription) saved in one transaction.
            // If anything fails, the whole operation rolls back — so a Plan can never leave an
            // orphan Member without its Subscription.
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Members.Add(member);

                if (subscription != null)
                    _context.Subscriptions.Add(subscription);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            _logger.LogInformation("Member {MemberId} created by Trainer {TrainerId}", member.Id, trainerId);

            if (request.MembershipPlanId.HasValue)
            {
                _logger.LogInformation(
                    "Member {MemberId} created with MembershipPlan {PlanId} by Trainer {TrainerId}",
                    member.Id, request.MembershipPlanId.Value, trainerId);
            }

            _logger.LogInformation("Member created successfully. MemberId: {MemberId}, TrainerId: {TrainerId}, GymId: {GymId}", 
                member.Id, trainerId, trainer.GymId);

            // Return response with Member and Trainer information
            return new MemberResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                PhoneNumber = member.PhoneNumber,
                CreatedAt = member.CreatedAt,
                TrainerId = member.TrainerId,
                GymId = member.GymId,
                TrainerName = trainer.FullName,
                gymName = trainer.Gym?.Name



            };
        }

        /// <summary>
        /// Retrieves a Member owned by the specified Trainer.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier</param>
        /// <param name="memberId">The Member identifier</param>
        /// <returns>Member details, or null when the Member is not accessible</returns>
        public async Task<MemberDetailsResponseDto?> GetMemberByIdForTrainerAsync(int trainerId, int memberId)
        {
            if (trainerId <= 0 || memberId <= 0)
            {
                return null;
            }

            var member = await _context.Members
                .AsNoTracking()
                .Where(m => m.Id == memberId && m.TrainerId == trainerId)
                .ProjectToType<MemberDetailsResponseDto>()
                .FirstOrDefaultAsync();

            if (member == null)
            {
                _logger.LogWarning(
                    "Member {MemberId} was not found for Trainer {TrainerId}",
                    memberId,
                    trainerId);
                return null;
            }

            _logger.LogInformation(
                "Member {MemberId} retrieved by Trainer {TrainerId}",
                memberId,
                trainerId);

            return member;
        }

        /// <summary>
        /// Retrieves a Member belonging to a Gym owned by the specified GymOwner.
        /// </summary>
        /// <param name="ownerId">The authenticated GymOwner identifier</param>
        /// <param name="memberId">The Member identifier</param>
        /// <returns>Member details, or null when the Member is not accessible</returns>
        public async Task<MemberDetailsResponseDto?> GetMemberByIdForOwnerAsync(int ownerId, int memberId)
        {
            if (ownerId <= 0 || memberId <= 0)
            {
                return null;
            }

            var member = await _context.Members
                .AsNoTracking()
                .Where(m => m.Id == memberId && m.Gym != null && m.Gym.GymOwnerID == ownerId)
                .ProjectToType<MemberDetailsResponseDto>()
                .FirstOrDefaultAsync();

            if (member == null)
            {
                _logger.LogWarning(
                    "Member {MemberId} was not found for Owner {OwnerId}",
                    memberId,
                    ownerId);
                return null;
            }

            _logger.LogInformation(
                "Member {MemberId} retrieved by Owner {OwnerId}",
                memberId,
                ownerId);

            return member;
        }

        /// <summary>
        /// Updates the basic information (FullName, PhoneNumber) of a Member
        /// that belongs to the specified Trainer. Only FullName and PhoneNumber
        /// are modified — TrainerId, GymId and CreatedAt stay unchanged, and no
        /// Subscription is touched.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier from JWT claims</param>
        /// <param name="memberId">The Member identifier from the route</param>
        /// <param name="request">Update request with FullName and PhoneNumber</param>
        /// <returns>The updated Member details</returns>
        public async Task<MemberDetailsResponseDto> UpdateMemberAsync(int trainerId, int memberId, UpdateMemberRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (trainerId <= 0 || memberId <= 0)
            {
                _logger.LogWarning("Invalid update request. TrainerId: {TrainerId}, MemberId: {MemberId}", trainerId, memberId);
                throw new InvalidOperationException("Invalid trainer or member identifier.");
            }

            _logger.LogInformation("Updating Member {MemberId} for Trainer: {TrainerId}", memberId, trainerId);

            // Load the Trainer to verify existence, active status and Gym ownership
            var trainer = await _context.Trainers
                .AsNoTracking()
                .Include(t => t.Gym)
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            if (!trainer.IsActive)
            {
                _logger.LogWarning("Attempt to update Member for inactive Trainer: {TrainerId}", trainerId);
                throw new InvalidOperationException("Cannot update Member for an inactive Trainer.");
            }

            // Load the Member as tracked so the update can be saved
            var member = await _context.Members
                .FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                _logger.LogWarning("Member not found: {MemberId}", memberId);
                throw new KeyNotFoundException($"Member with id {memberId} not found.");
            }

            // Ownership check — a Trainer can only update their own Members.
            // Reported as not found so the existence of other Trainers' Members is not exposed.
            if (member.TrainerId != trainerId)
            {
                _logger.LogWarning(
                    "Member {MemberId} belongs to another Trainer. Requesting TrainerId: {TrainerId}",
                    memberId,
                    trainerId);
                throw new KeyNotFoundException($"Member with id {memberId} not found.");
            }

            // Phone uniqueness within the same Gym, excluding the current Member
            // (so keeping the same phone number is allowed)
            var phoneExists = await _context.Members
                .AsNoTracking()
                .AnyAsync(m =>
                    m.GymId == trainer.GymId &&
                    m.PhoneNumber == request.PhoneNumber &&
                    m.Id != memberId);

            if (phoneExists)
            {
                _logger.LogWarning(
                    "Attempt to update Member {MemberId} with phone number already used in the same Gym: {PhoneNumber}",
                    memberId,
                    request.PhoneNumber);
                throw new InvalidOperationException("A member with this phone number already exists.");
            }

            // Update ONLY the basic information — TrainerId, GymId and CreatedAt stay unchanged
            member.FullName = request.FullName;
            member.PhoneNumber = request.PhoneNumber;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Member updated successfully. MemberId: {MemberId}, TrainerId: {TrainerId}",
                memberId,
                trainerId);

            return new MemberDetailsResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                PhoneNumber = member.PhoneNumber,
                CreatedAt = member.CreatedAt,
                TrainerId = member.TrainerId,
                TrainerName = trainer.FullName,
                GymId = member.GymId,
                GymName = trainer.Gym?.Name
            };
        }

        /// <summary>
        /// Retrieves the Members registered by the specified Trainer.
        /// The query is always restricted to Member.TrainerId == trainerId so a
        /// Trainer can only see their own Members, never those of another Trainer.
        /// Search filters (Name, Phone) are optional and applied in the database.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer identifier from JWT claims</param>
        /// <param name="request">Optional search filters (Name, Phone)</param>
        /// <returns>The list of the Trainer's Members</returns>
        public async Task<List<MemberResponseDto>> GetMyMembersAsync(int trainerId, MemberSearchRequestDto request)
        {
            if (trainerId <= 0)
            {
                _logger.LogWarning("Invalid TrainerId in GetMyMembers: {TrainerId}", trainerId);
                throw new InvalidOperationException("Invalid trainer identifier.");
            }

            if (request == null)
                request = new MemberSearchRequestDto();

            _logger.LogInformation("Retrieving Members for Trainer {TrainerId}", trainerId);

            // Verify the authenticated Trainer exists and is active, following
            // the existing Member business rules used by Create/Update.
            var trainer = await _context.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            if (!trainer.IsActive)
            {
                _logger.LogWarning("Attempt to retrieve Members for inactive Trainer: {TrainerId}", trainerId);
                throw new InvalidOperationException("Cannot retrieve Members for an inactive Trainer.");
            }

            // Build the query, ALWAYS scoped to the authenticated Trainer.
            var query = _context.Members
                .AsNoTracking()
                .Where(m => m.TrainerId == trainerId);

            // Optional name filter (partial match).
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                var name = request.Name.Trim();
                _logger.LogInformation("Filtering Members by name for Trainer {TrainerId}", trainerId);
                query = query.Where(m => m.FullName != null && m.FullName.Contains(name));
            }

            // Optional exact phone filter.
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                _logger.LogInformation("Filtering Members by phone for Trainer {TrainerId}", trainerId);
                query = query.Where(m => m.PhoneNumber == request.Phone);
            }

            // Project directly to the response DTO and execute in the database.
            var members = await query
                .ProjectToType<MemberResponseDto>()
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} Members for Trainer {TrainerId}", members.Count, trainerId);

            return members;
        }
    }
}
