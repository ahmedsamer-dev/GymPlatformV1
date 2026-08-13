using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Member;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    /// <summary>
    /// Controller for Member management operations.
    /// Trainers can create Members within their own Gym.
    /// </summary>
    [ApiController]
    [Route("api/members")]
    [Authorize(Roles = "Trainer")]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ILogger<MemberController> _logger;

        public MemberController(IMemberService memberService, ILogger<MemberController> logger)
        {
            _memberService = memberService ?? throw new ArgumentNullException(nameof(memberService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a new Member within the authenticated Trainer's Gym.
        /// A Trainer can only create Members in their own Gym.
        /// </summary>
        /// <param name="request">Member creation request with FullName and PhoneNumber</param>
        /// <returns>Created Member response with details</returns>
        [HttpPost]
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
    }
}
