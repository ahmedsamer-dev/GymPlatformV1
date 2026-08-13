using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    /// <summary>
    /// Controller for Trainer authentication operations.
    /// Provides endpoints for Trainer login.
    /// </summary>
    [ApiController]
    [Route("api/auth/trainer")]
    public class TrainerAuthController : ControllerBase
    {
        private readonly ITrainerAuthService _authService;
        private readonly ILogger<TrainerAuthController> _logger;

        public TrainerAuthController(ITrainerAuthService authService, ILogger<TrainerAuthController> logger)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Authenticates a Trainer and returns a JWT token.
        /// </summary>
        /// <param name="request">Login request with UserName and Password</param>
        /// <returns>Login response with JWT token if successful</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(TrainerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TrainerLoginResponseDto>> Login([FromBody] TrainerLoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);

                if (!response.Success)
                {
                    return BadRequest(response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during Trainer login");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred during login",
                    traceId = HttpContext.TraceIdentifier
                });
            }
        }
    }
}
