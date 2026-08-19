using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Member;
using Gym_Platform_V1.DTOs.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        private readonly ILogger<TrainerController> _logger;

        public TrainerController(
            IMemberService memberService,
            ISubscriptionService subscriptionService,
            ILogger<TrainerController> logger)
        {
            _memberService = memberService ?? throw new ArgumentNullException(nameof(memberService));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
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
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Authorization failed while creating subscription");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating subscription");
                return BadRequest(new { message = ex.Message });
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
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Authorization failed while using session");
                return Unauthorized(new { message = ex.Message });
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
    }
}
