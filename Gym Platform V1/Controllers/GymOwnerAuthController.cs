using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    [ApiController]
    [Route("api/auth/gym-owner")]
    public class GymOwnerAuthController : ControllerBase
    {
        private readonly IGymOwnerAuthService _authService;
        private readonly ILogger<GymOwnerAuthController> _logger;

        public GymOwnerAuthController(IGymOwnerAuthService authService, ILogger<GymOwnerAuthController> logger)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(GymOwnerLoginResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<GymOwnerLoginResponseDto>> Login([FromBody] GymOwnerLoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during GymOwner login");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred during login" });
            }
        }
    }
}
