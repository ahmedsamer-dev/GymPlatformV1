using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.GymOwnerApplication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    [ApiController]
    [Route("api/gym-owner-applications")]
    public class GymOwnerApplicationController : ControllerBase
    {
        private readonly IGymOwnerApplicationService _service;
        private readonly ILogger<GymOwnerApplicationController> _logger;

        public GymOwnerApplicationController(IGymOwnerApplicationService service, ILogger<GymOwnerApplicationController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Submit a new GymOwner application. Public endpoint.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(GymOwnerApplicationResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GymOwnerApplicationResponseDto>> Submit([FromBody] CreateGymOwnerApplicationRequestDto request)
        {

            try
            {
                var response = await _service.SubmitApplicationAsync(request);
                return CreatedAtAction(nameof(GetAll), null, response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while submitting application");
                // If duplicate exists, return conflict
                if (ex.Message.Contains("exists") || ex.Message.Contains("already"))
                {
                    return Conflict(new { message = ex.Message });
                }

                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while submitting application");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred", traceId = HttpContext.TraceIdentifier });
            }
        }

        /// <summary>
        /// Get all GymOwner applications. Admin only.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(IEnumerable<GymOwnerApplicationResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<GymOwnerApplicationResponseDto>>> GetAll()
        {
            try
            {
                var list = await _service.GetApplicationsAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving applications");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred", traceId = HttpContext.TraceIdentifier });
            }
        }

        /// <summary>
        /// Approve a pending application. Admin only.
        /// </summary>
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Approve(int id)
        {
            try
            {
                await _service.ApproveApplicationAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Application not found for approval: {Id}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during approval: {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error approving application: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred", traceId = HttpContext.TraceIdentifier });
            }
        }

        /// <summary>
        /// Reject a pending application with a reason. Admin only.
        /// </summary>
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectApplicationRequestDto request)
        {
         
            try
            {
                await _service.RejectApplicationAsync(id, request.RejectionReason);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Application not found for rejection: {Id}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during rejection: {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid rejection request for: {Id}", id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error rejecting application: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred", traceId = HttpContext.TraceIdentifier });
            }
        }
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> GetPendingApplications()
        {
            var applications =
                await _service.GetPendingApplicationsAsync();

            return Ok(applications);
        }
    }
}
