using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.Common.Exceptions;
using Gym_Platform_V1.data.DTOs.Member;
using Gym_Platform_V1.data.DTOs.MembershipPlan;
using Gym_Platform_V1.data.DTOs.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    // Controller for all operations performed by the Trainer (actor = Trainer).
    // Covers Member creation (via MemberService) and Subscriptions (via SubscriptionService).
    // TrainerId always comes from the authenticated JWT (NameIdentifier claim).
    [ApiController]
    [Route("api/trainer")]
    [Authorize(Roles = "Trainer")]
    public class TrainerController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IMembershipPlanService _membershipPlanService;
        private readonly ILogger<TrainerController> _logger;

        public TrainerController(
            IMemberService memberService,
            ISubscriptionService subscriptionService,
            IMembershipPlanService membershipPlanService,
            ILogger<TrainerController> logger)
        {
            _memberService = memberService ?? throw new ArgumentNullException(nameof(memberService));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _membershipPlanService = membershipPlanService ?? throw new ArgumentNullException(nameof(membershipPlanService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ============================================
        // MEMBERS
        // ============================================

        /// <summary>
        /// Creates a new Member within the authenticated Trainer's Gym.
        /// A Trainer can only create Members in their own Gym.
        /// </summary>
        /// <param name="request">Member creation request with FullName and PhoneNumber</param>
        /// <returns>Created Member response with details</returns>
        [HttpPost("members")]
        [ProducesResponseType(typeof(MemberResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MemberResponseDto>> CreateMember([FromBody] CreateMemberRequestDto request)
        {
            try
            {
                // Get TrainerId from JWT claims
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(trainerIdClaim, out int trainerId))
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                _logger.LogInformation("Creating Member for Trainer: {TrainerId}", trainerId);

                var response = await _memberService.CreateMemberAsync(trainerId, request);

                return CreatedAtAction(nameof(CreateMember), null, response);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found");
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning(ex, "Authorization/ownership check failed while creating Member");
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during Member creation");
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Invalid request data");
                return BadRequest(new { message = "Invalid request data" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating Member");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred",
                    traceId = HttpContext.TraceIdentifier
                });
            }
        }

        /// <summary>
        /// Updates the basic information (FullName, PhoneNumber) of a Member
        /// that belongs to the authenticated Trainer. The Member stays with the
        /// same Trainer and Gym, and no Subscription is modified.
        /// </summary>
        /// <param name="memberId">The Member identifier from the route</param>
        /// <param name="request">Update request with FullName and PhoneNumber</param>
        /// <returns>200 OK with the updated Member details</returns>
        [HttpPut("members/{memberId}")]
        [ProducesResponseType(typeof(MemberDetailsResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MemberDetailsResponseDto>> UpdateMember(
            int memberId,
            [FromBody] UpdateMemberRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body cannot be null" });

                if (memberId <= 0)
                    return BadRequest(new { message = "Member ID must be greater than 0" });

                // TrainerId is extracted from the JWT token, NOT from the client.
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out int trainerId))
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var updated = await _memberService.UpdateMemberAsync(trainerId, memberId, request);

                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Member or Trainer not found while updating Member");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating Member");
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Invalid request data while updating Member");
                return BadRequest(new { message = "Invalid request data" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating Member");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred",
                    traceId = HttpContext.TraceIdentifier
                });
            }
        }

        /// <summary>
        /// Retrieves a Member belonging to the authenticated Trainer.
        /// </summary>
        /// <param name="memberId">The Member identifier</param>
        /// <returns>Member details, or 404 when the Member is not accessible</returns>
        [HttpGet("members/{memberId}")]
        [ProducesResponseType(typeof(MemberDetailsResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MemberDetailsResponseDto>> GetMemberById(int memberId)
        {
            try
            {
                if (memberId <= 0)
                {
                    return BadRequest(new { message = "Member ID must be greater than 0" });
                }

                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out var trainerId) || trainerId <= 0)
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var member = await _memberService.GetMemberByIdForTrainerAsync(trainerId, memberId);
                if (member == null)
                {
                    return NotFound(new { message = $"Member with id {memberId} not found." });
                }

                return Ok(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving Member by Trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        /// <summary>
        /// Retrieves the Members registered by the authenticated Trainer.
        /// TrainerId always comes from the JWT (NameIdentifier claim), never from
        /// the client. Optional query filters: name (partial) and phone (exact).
        /// </summary>
        /// <param name="request">Optional search filters (Name, Phone)</param>
        /// <returns>200 OK with the list of the Trainer's Members (possibly empty)</returns>
        [HttpGet("members")]
        [ProducesResponseType(typeof(List<MemberResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<MemberResponseDto>>> GetMyMembers(
            [FromQuery] MemberSearchRequestDto request)
        {
            try
            {
                // TrainerId is extracted from the JWT token, NOT from the client.
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out var trainerId) || trainerId <= 0)
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var members = await _memberService.GetMyMembersAsync(trainerId, request);

                return Ok(members);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found while retrieving Members");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while retrieving Members");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving Members by Trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // GET /api/trainer/membership-plans
        //
        // Returns the Membership Plans available in the Gym the authenticated Trainer
        // belongs to. The Trainer uses this list when creating a Subscription so they
        // can select a Member + a MembershipPlan.
        // TrainerId comes exclusively from the JWT token — never from the client.
        // The Gym is resolved from the JWT identity inside the service, so a Trainer
        // can only see plans from the Gym they work for. An empty result returns 200 OK with [].
        [HttpGet("membership-plans")]
        [ProducesResponseType(typeof(List<MembershipPlanResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<MembershipPlanResponseDto>>> GetMembershipPlans()
        {
            try
            {
                // TrainerId is extracted from the JWT token, NOT from the client.
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out int trainerId) || trainerId <= 0)
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var plans = await _membershipPlanService.GetPlansForTrainerAsync(trainerId);

                return Ok(plans);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found while retrieving membership plans");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while retrieving membership plans");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving membership plans by Trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // ============================================
        // SUBSCRIPTIONS
        // ============================================

        // POST /api/trainer/subscriptions
        //
        // Creates a Subscription for one of the authenticated Trainer's Members
        // using an existing MembershipPlan from the Trainer's Gym.
        // The client only supplies MemberId and MembershipPlanId — all calculated
        // fields (dates, price, sessions, status) are set by the server.
        //
        // Renewals use this same endpoint: a new Subscription is created and the
        // previous one remains in the database as history.
        [HttpPost("subscriptions")]
        [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SubscriptionResponseDto>> CreateSubscription([FromBody] CreateSubscriptionRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body cannot be null" });

                // TrainerId is extracted from the JWT token, NOT from the client.
                // Trainer tokens carry the id in the NameIdentifier claim (see TokenService).
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out int trainerId))
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var created = await _subscriptionService.CreateSubscriptionAsync(trainerId, request);

                // No public GET endpoint exists for subscriptions yet,
                // so return Created with an empty location.
                return Created("", created);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found while creating subscription");
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning(ex, "Authorization/ownership check failed while creating subscription");
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating subscription");
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while creating subscription. Inner: {InnerMessage}", ex.InnerException?.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred while saving the subscription" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating subscription");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // POST /api/trainer/subscriptions/{subscriptionId}/use-session
        //
        // Records that the authenticated Trainer used exactly ONE session from a
        // session-based Subscription belonging to one of their Members.
        //
        // subscriptionId comes from the route; there is no request body.
        // RemainingSessions is decremented by exactly one on the server and can
        // never become negative.
        [HttpPost("subscriptions/{subscriptionId}/use-session")]
        [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SubscriptionResponseDto>> UseSession(int subscriptionId)
        {
            try
            {
                // Basic route validation — reject invalid ids before hitting the service/database.
                if (subscriptionId <= 0)
                    return BadRequest(new { message = "Subscription ID must be greater than 0" });

                // TrainerId is extracted from the JWT token, NOT from the client.
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out int trainerId))
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var updated = await _subscriptionService.UseSessionAsync(trainerId, subscriptionId);

                // 200 OK with the updated Subscription so the frontend immediately
                // knows the remaining sessions and status.
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Subscription not found while using session");
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning(ex, "Authorization/ownership check failed while using session");
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while using session");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while using session");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // GET /api/trainer/subscriptions
        //
        // Returns the Subscriptions belonging to the authenticated Trainer's Members.
        // TrainerId comes exclusively from the JWT token — never from the client.
        // The ownership condition (Subscription.Member.TrainerId == trainerId) is applied
        // in the service in the database query, so a Trainer can only see their own
        // Members' subscriptions. An empty result returns 200 OK with [].
        [HttpGet("subscriptions")]
        [ProducesResponseType(typeof(List<SubscriptionResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<SubscriptionResponseDto>>> GetMySubscriptions()
        {
            try
            {
                // TrainerId is extracted from the JWT token, NOT from the client.
                var trainerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(trainerIdClaim, out int trainerId) || trainerId <= 0)
                {
                    _logger.LogWarning("Invalid or missing TrainerId in JWT claims");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var subscriptions = await _subscriptionService.GetMySubscriptionsAsync(trainerId);

                return Ok(subscriptions);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found while retrieving subscriptions");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while retrieving subscriptions");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving subscriptions by Trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }
    }
}
