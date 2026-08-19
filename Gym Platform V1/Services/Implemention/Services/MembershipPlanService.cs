using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.MembershipPlan;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class MembershipPlanService : IMembershipPlanService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ILogger<MembershipPlanService> _logger;

        public MembershipPlanService(GymPlatformDbContext dbContext, ILogger<MembershipPlanService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Creates a MembershipPlan inside one of the authenticated Owner's Gyms.
        //
        // ownerId: extracted from JWT — never accepted from the client.
        // request.GymId: supplied by the client because an Owner may own multiple Gyms,
        //                but it is only trusted AFTER verifying Gym.GymOwnerID == ownerId.
        //
        // Security flow: JWT → ownerId → GymId from request → find Gym →
        //                verify ownership → create the plan.
        // A client can never create a plan in another Owner's Gym just by changing GymId.
        public async Task<MembershipPlanResponseDto> CreateMembershipPlanAsync(
    int ownerId,
    CreateMembershipPlanRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation(
                "Creating MembershipPlan for OwnerId: {OwnerId}, GymId: {GymId}",
                ownerId,
                request.GymId);

            // Verify that the Gym belongs to the authenticated Owner
            var gym = await _dbContext.Gyms
                .AsNoTracking()
                .FirstOrDefaultAsync(g =>
                    g.Id == request.GymId &&
                    g.GymOwnerID == ownerId);

            if (gym == null)
            {
                _logger.LogWarning(
                    "OwnerId {OwnerId} attempted to create a MembershipPlan for GymId {GymId} that does not belong to them.",
                    ownerId,
                    request.GymId);

                throw new KeyNotFoundException(
                    $"Gym with id {request.GymId} not found or does not belong to you.");
            }

            // Prevent duplicate plan names inside the same Gym
            var nameExists = await _dbContext.MembershipPlans
                .AsNoTracking()
                .AnyAsync(mp =>
                    mp.GymId == request.GymId &&
                    mp.Name == request.Name);

            if (nameExists)
            {
                _logger.LogWarning(
                    "Duplicate MembershipPlan name {PlanName} for GymId {GymId}.",
                    request.Name,
                    request.GymId);

                throw new InvalidOperationException(
                    $"A MembershipPlan with the name '{request.Name}' already exists in this gym.");
            }
       
         

            var membershipPlan = new MembershipPlan
            {
                Name = request.Name,
                Price = request.Price,
                DurationInDays = request.DurationInDays,
                IsSessionBased = request.IsSessionBased,
                NumberOfSessions = request.NumberOfSessions,
                GymId = request.GymId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.MembershipPlans.Add(membershipPlan);

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "MembershipPlan created successfully. PlanId: {PlanId}, GymId: {GymId}, OwnerId: {OwnerId}",
                membershipPlan.Id,
                membershipPlan.GymId,
                ownerId);

            return new MembershipPlanResponseDto
            {
                Id = membershipPlan.Id,
                Name = membershipPlan.Name,
                Price = membershipPlan.Price,
                DurationInDays = membershipPlan.DurationInDays,
                IsSessionBased = membershipPlan.IsSessionBased,
                NumberOfSessions = membershipPlan.NumberOfSessions,
                GymId = membershipPlan.GymId,
                CreatedAt = membershipPlan.CreatedAt
            };
        }
    }
}
