using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.MembershipPlan;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    [ApiController]
    [Route("api/membership-plans")]
    public class MembershipPlanController : ControllerBase
    {
        private readonly IMembershipPlanService _membershipPlanService;
        private readonly ILogger<MembershipPlanController> _logger;

        public MembershipPlanController(IMembershipPlanService membershipPlanService, ILogger<MembershipPlanController> logger)
        {
            _membershipPlanService = membershipPlanService ?? throw new ArgumentNullException(nameof(membershipPlanService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // POST /api/membership-plans
        //
        // Creates a MembershipPlan inside one of the authenticated Owner's Gyms.
        // The client supplies GymId (an Owner may own several Gyms), but the service
        // verifies the Gym belongs to the caller before creating anything.
        //
        // ownerId comes exclusively from the JWT token — never from the client.
        // This prevents an Owner from impersonating another Owner.
        [HttpPost]
        [Authorize(Roles = "GymOwner")]
        [ProducesResponseType(typeof(MembershipPlanResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MembershipPlanResponseDto>> CreateMembershipPlan([FromBody] CreateMembershipPlanRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body cannot be null" });

                // ownerId is extracted from the JWT token, NOT from the client.
                // The "OwnerId" claim is set during GymOwner login (see TokenService).
                // Falls back to NameIdentifier as a safety net.
                var ownerIdClaim = User.FindFirst("OwnerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (ownerIdClaim == null || !int.TryParse(ownerIdClaim.Value, out var ownerId))
                {
                    return Unauthorized(new { message = "OwnerId claim missing or invalid" });
                }

                var created = await _membershipPlanService.CreateMembershipPlanAsync(ownerId, request);

                // No public GET-by-id endpoint exists for membership plans yet,
                // so return Created with an empty location, matching the CreateTrainer convention.
                return Created("", created);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Gym not found while creating membership plan");
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Authorization failed while creating membership plan");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating membership plan");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating membership plan");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }
    }
}
