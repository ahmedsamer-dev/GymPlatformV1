using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    // Controller for Subscription operations.
    // Only Trainers can create Subscriptions and use sessions.
    // TrainerId always comes from the authenticated JWT (NameIdentifier claim —
    // same convention as MemberController for Trainer tokens).
    [ApiController]
    [Route("api/subscriptions/add")]
    [Authorize(Roles = "Trainer")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(ISubscriptionService subscriptionService, ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // POST /api/subscriptions
        //
        // Creates a Subscription for one of the authenticated Trainer's Members
        // using an existing MembershipPlan from the Trainer's Gym.
        // The client only supplies MemberId and MembershipPlanId — all calculated
        // fields (dates, price, sessions, status) are set by the server.
        //
        // Renewals use this same endpoint: a new Subscription is created and the
        // previous one remains in the database as history.
        [HttpPost]
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
                // so return Created with an empty location (CreateTrainer convention).
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

        // POST /api/subscriptions/{subscriptionId}/use-session
        //
        // Records that the authenticated Trainer used exactly ONE session from a
        // session-based Subscription belonging to one of their Members.
        //
        // subscriptionId comes from the route; there is no request body.
        // RemainingSessions is decremented by exactly one on the server and can
        // never become negative.
        [HttpPost("{subscriptionId}/use-session")]
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
