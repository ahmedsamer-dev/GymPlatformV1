using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.data.DTOs.GymOwnerApplication;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    /// <summary>
    /// Public endpoint for submitting a GymOwner application.
    /// The applicant does not have the GymOwner role yet, so this endpoint
    /// requires no authentication. Admin review operations live in AdminController
    /// under /api/admin/gym-owner-applications.
    /// </summary>
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
                return Created("", response);
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
    }
}
