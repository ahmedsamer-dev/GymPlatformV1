using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.Common.Exceptions;
using Gym_Platform_V1.data.DTOs.Subscription;
using Gym_Platform_V1.enums;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(GymPlatformDbContext dbContext, ILogger<SubscriptionService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Creates a Subscription for a Member using an existing MembershipPlan.
        //
        // trainerId: extracted from JWT — never accepted from the client.
        //
        // Ownership chain enforced before creation:
        //   JWT trainerId → Trainer exists & active
        //                 → Member.TrainerId == trainerId (Trainer owns the Member)
        //                 → MembershipPlan.GymId == Trainer.GymId (Plan from the same Gym)
        //
        // All calculated fields (StartDate, EndDate, TotalPrice, RemainingSessions, Status,
        // CreatedAt) are derived from the MembershipPlan on the server — the client
        // can never override them.
        public async Task<SubscriptionResponseDto> CreateSubscriptionAsync(
            int trainerId,
            CreateSubscriptionRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation(
                "CreateSubscription requested by TrainerId: {TrainerId}, MemberId: {MemberId}, MembershipPlanId: {MembershipPlanId}",
                trainerId, request.MemberId, request.MembershipPlanId);

            // Load the Trainer read-only (validation only — the Trainer is not modified here).
            var trainer = await _dbContext.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            if (!trainer.IsActive)
            {
                _logger.LogWarning("Inactive Trainer attempted to create a Subscription: {TrainerId}", trainerId);
                throw new InvalidOperationException("Trainer account is inactive.");
            }

            // Load the Member read-only. The Member is linked to the new Subscription via FK only.
            var member = await _dbContext.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == request.MemberId);

            if (member == null)
            {
                _logger.LogWarning("Member not found: {MemberId}", request.MemberId);
                throw new KeyNotFoundException($"Member with id {request.MemberId} not found.");
            }

            // The Member must belong to the authenticated Trainer.
            // A Trainer must NOT create a Subscription for another Trainer's Member.
            if (member.TrainerId != trainerId)
            {
                _logger.LogWarning(
                    "TrainerId {TrainerId} attempted to create a Subscription for MemberId {MemberId} that belongs to TrainerId {OwnerTrainerId}",
                    trainerId, request.MemberId, member.TrainerId);
                throw new ForbiddenException("You can only create subscriptions for your own members.");
            }

            // Build (validate ownership + active rule) and create, reusing the shared logic.
            var subscription = await BuildSubscriptionForMemberAsync(trainerId, member, request.MembershipPlanId);

            // Renewal rule: a renewal is simply a NEW Subscription; the previous one
            // stays in the database untouched as history.
            _dbContext.Subscriptions.Add(subscription);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Subscription created successfully. SubscriptionId: {SubscriptionId}, TrainerId: {TrainerId}, MemberId: {MemberId}, MembershipPlanId: {MembershipPlanId}",
                subscription.Id, trainerId, member.Id, subscription.MembershipPlanId);

            var plan = await _dbContext.MembershipPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(mp => mp.Id == subscription.MembershipPlanId);

            return ToResponseDto(subscription, member, plan);
        }

        // Builds (WITHOUT saving) a Subscription for a Member that already belongs to the
        // authenticated Trainer, using a MembershipPlan from the Trainer's Gym.
        //
        // Validation performed here (shared with CreateSubscriptionAsync):
        //   - Trainer exists and is active
        //   - no active Subscription already exists for the Member (safeguard)
        //   - MembershipPlan exists AND MembershipPlan.GymId == Trainer.GymId
        //
        // The returned entity is NOT added to the DbContext and NOT saved. This lets
        // MemberService add it together with the new Member and persist both in one
        // transaction (atomic "create Member + first Subscription").
        public async Task<Subscription> BuildSubscriptionForMemberAsync(
            int trainerId,
            Member member,
            int membershipPlanId)
        {
            if (member == null)
                throw new ArgumentNullException(nameof(member));

            if (membershipPlanId <= 0)
                throw new InvalidOperationException("Invalid membership plan identifier.");

            _logger.LogInformation(
                "BuildSubscriptionForMember requested by TrainerId: {TrainerId}, MembershipPlanId: {MembershipPlanId}",
                trainerId, membershipPlanId);

            // Load the Trainer read-only (validation only).
            var trainer = await _dbContext.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            if (!trainer.IsActive)
            {
                _logger.LogWarning("Inactive Trainer attempted to create a Subscription: {TrainerId}", trainerId);
                throw new InvalidOperationException("Trainer account is inactive.");
            }

            // Safeguard: a Member must never have more than one active Subscription.
            // For a brand-new Member this will naturally be false, but the rule is enforced.
            var activeSubscriptionExists = await _dbContext.Subscriptions
                .AnyAsync(s => s.MemberId == member.Id && s.Status == SubscriptionStatus.Active);

            if (activeSubscriptionExists)
            {
                throw new InvalidOperationException("Member already has an active subscription.");
            }

            // Load the MembershipPlan read-only — used for both validation and calculation.
            var membershipPlan = await _dbContext.MembershipPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(mp => mp.Id == membershipPlanId);

            if (membershipPlan == null)
            {
                _logger.LogWarning("MembershipPlan not found: {MembershipPlanId}", membershipPlanId);
                throw new KeyNotFoundException($"Membership plan with id {membershipPlanId} not found.");
            }

            // The Plan must belong to the same Gym as the Trainer/Member.
            // Prevents a Trainer in Gym A from using a MembershipPlan from Gym B.
            if (membershipPlan.GymId != trainer.GymId)
            {
                _logger.LogWarning(
                    "TrainerId {TrainerId} (GymId {TrainerGymId}) attempted to use MembershipPlanId {MembershipPlanId} from GymId {PlanGymId}",
                    trainerId, trainer.GymId, membershipPlanId, membershipPlan.GymId);
                throw new ForbiddenException("The membership plan does not belong to your gym.");
            }

            var subscription = BuildSubscriptionEntity(member, membershipPlan);

            _logger.LogInformation(
                "Subscription entity built for TrainerId: {TrainerId}, MembershipPlanId: {MembershipPlanId}",
                trainerId, membershipPlanId);

            return subscription;
        }

        // Shared projection of a Subscription from a Member + MembershipPlan.
        // All calculated values derive from the plan:
        // - Time-based plan: EndDate = StartDate + DurationInDays, no sessions.
        // - Session-based plan: RemainingSessions = plan.NumberOfSessions.
        //   Session plans also have DurationInDays > 0 (enforced at plan creation),
        //   so the same EndDate rule applies — no separate expiration rule exists in the project.
        //
        // Entity tracking note:
        // - For a brand-new Member (Id == 0), setting Member = member enables EF Core to
        //   automatically link the generated Member identity upon insert in one transaction.
        // - For an existing Member (Id > 0), Member navigation must remain null so EF Core
        //   does NOT treat the detached Member entity as Added and attempt an invalid INSERT.
        private static Subscription BuildSubscriptionEntity(Member member, MembershipPlan membershipPlan)
        {
            return new Subscription
            {
                Member = member.Id == 0 ? member : null,
                MemberId = member.Id,
                MembershipPlanId = membershipPlan.Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(membershipPlan.DurationInDays),
                TotalPrice = membershipPlan.Price,
                RemainingSessions = membershipPlan.IsSessionBased ? membershipPlan.NumberOfSessions : 0,
                Status = SubscriptionStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
        }

        private static SubscriptionResponseDto ToResponseDto(
            Subscription subscription,
            Member? member,
            MembershipPlan? membershipPlan)
        {
            return new SubscriptionResponseDto
            {
                Id = subscription.Id,
                MemberId = subscription.MemberId,
                MemberName = member?.FullName,
                MembershipPlanId = subscription.MembershipPlanId,
                MembershipPlanName = membershipPlan?.Name,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                TotalPrice = subscription.TotalPrice,
                RemainingSessions = subscription.RemainingSessions,
                Status = subscription.Status,
                CreatedAt = subscription.CreatedAt
            };
        }

        // Records that the Trainer used exactly ONE session from a session-based Subscription.
        //
        // trainerId: extracted from JWT — never from the client.
        // subscriptionId: from the route.
        //
        // Ownership chain enforced before decrementing:
        //   JWT trainerId → Subscription exists
        //                 → Subscription.Member.TrainerId == trainerId
        //                 → Subscription is session-based, active, and has sessions left.
        public async Task<SubscriptionResponseDto> UseSessionAsync(
            int trainerId,
            int subscriptionId)
        {
            if (subscriptionId <= 0)
                throw new InvalidOperationException("Subscription ID must be greater than 0.");

            _logger.LogInformation(
                "UseSession requested by TrainerId: {TrainerId} for SubscriptionId: {SubscriptionId}",
                trainerId, subscriptionId);

            // Load the Subscription WITH Member and MembershipPlan so ownership and
            // plan type can be verified. Tracked (no AsNoTracking) because
            // RemainingSessions/Status will be modified and saved.
            var subscription = await _dbContext.Subscriptions
                .Include(s => s.Member)
                .Include(s => s.MembershipPlan)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);

            if (subscription == null)
            {
                _logger.LogWarning("Subscription not found: {SubscriptionId}", subscriptionId);
                throw new KeyNotFoundException($"Subscription with id {subscriptionId} not found.");
            }

            // The Subscription must belong to a Member of the authenticated Trainer.
            // A Trainer must NOT use sessions from another Trainer's Member.
            if (subscription.Member == null || subscription.Member.TrainerId != trainerId)
            {
                _logger.LogWarning(
                    "TrainerId {TrainerId} attempted to use a session on SubscriptionId {SubscriptionId} that belongs to another Trainer's member",
                    trainerId, subscriptionId);
                throw new ForbiddenException("You can only use sessions for your own members' subscriptions.");
            }

            // Only session-based Subscriptions carry usable sessions.
            if (subscription.MembershipPlan == null || !subscription.MembershipPlan.IsSessionBased)
            {
                _logger.LogWarning(
                    "UseSession rejected - SubscriptionId {SubscriptionId} is not session-based",
                    subscriptionId);
                throw new InvalidOperationException("This subscription is not session-based.");
            }

            // Only Active Subscriptions can be used (existing SubscriptionStatus convention).
            if (subscription.Status != SubscriptionStatus.Active)
            {
                _logger.LogWarning(
                    "UseSession rejected - SubscriptionId {SubscriptionId} is not active. Status: {Status}",
                    subscriptionId, subscription.Status);
                throw new InvalidOperationException($"Subscription is not active (current status: {subscription.Status}).");
            }

            // Guard against going negative — reject when nothing is left to consume.
            if (subscription.RemainingSessions <= 0)
            {
                _logger.LogWarning(
                    "UseSession rejected - SubscriptionId {SubscriptionId} has no remaining sessions",
                    subscriptionId);
                throw new InvalidOperationException("No remaining sessions on this subscription.");
            }

            _logger.LogInformation(
                "UseSession decrementing SubscriptionId {SubscriptionId}: {RemainingBefore} → {RemainingAfter}",
                subscriptionId, subscription.RemainingSessions, subscription.RemainingSessions - 1);

            // Consume exactly ONE session.
            subscription.RemainingSessions--;

            // When the last session is used the subscription is finished.
            // SubscriptionStatus has no "Completed" value, so Expired (the existing
            // "no longer usable" state) marks it as exhausted without inventing a new enum value.
            if (subscription.RemainingSessions == 0)
            {
                subscription.Status = SubscriptionStatus.Expired;
                _logger.LogInformation("SubscriptionId {SubscriptionId} exhausted — status set to Expired", subscriptionId);
            }

            await _dbContext.SaveChangesAsync();

            return new SubscriptionResponseDto
            {
                Id = subscription.Id,
                MemberId = subscription.MemberId,
                MemberName = subscription.Member?.FullName,
                MembershipPlanId = subscription.MembershipPlanId,
                MembershipPlanName = subscription.MembershipPlan?.Name,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                TotalPrice = subscription.TotalPrice,
                RemainingSessions = subscription.RemainingSessions,
                Status = subscription.Status,
                CreatedAt = subscription.CreatedAt
            };
        }

        // Retrieves the Subscriptions belonging to the authenticated Trainer's Members.
        //
        // trainerId: extracted from JWT — never accepted from the client.
        //
        // Ownership is enforced directly in the database query:
        //   Subscription.Member.TrainerId == trainerId
        // so a Trainer can only see Subscriptions of their own Members.
        // The active status of the Trainer is NOT required for a read-only listing;
        // existing write operations keep enforcing the active rule.
        public async Task<List<SubscriptionResponseDto>> GetMySubscriptionsAsync(int trainerId)
        {
            if (trainerId <= 0)
            {
                _logger.LogWarning("Invalid TrainerId in GetMySubscriptionsAsync: {TrainerId}", trainerId);
                throw new InvalidOperationException("Invalid trainer identifier.");
            }

            _logger.LogInformation("Retrieving subscriptions for TrainerId: {TrainerId}", trainerId);

            // Validate that the authenticated Trainer exists (mirrors GetMyMembersAsync).
            var trainer = await _dbContext.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            // Single projection query. The ownership filter (Member.TrainerId == trainerId)
            // is applied in the database — no in-memory filtering and no unnecessary Includes.
            var subscriptions = await _dbContext.Subscriptions
                .AsNoTracking()
                .Where(s => s.Member != null && s.Member.TrainerId == trainerId)
                .ProjectToType<SubscriptionResponseDto>()
                .ToListAsync();

            _logger.LogInformation(
                "Subscriptions retrieved for Trainer {TrainerId}: {Count}",
                trainerId,
                subscriptions.Count);

            return subscriptions;
        }
    }
}
