using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.data.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    /// <summary>
    /// Authentication controller for all actors (Admin, GymOwner, Trainer).
    /// All login endpoints are public and reuse the existing authentication services.
    /// No authentication logic lives here — each action delegates to its actor's auth service.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAdminAuthService _adminAuthService;
        private readonly IGymOwnerAuthService _gymOwnerAuthService;
        private readonly ITrainerAuthService _trainerAuthService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAdminAuthService adminAuthService,
            IGymOwnerAuthService gymOwnerAuthService,
            ITrainerAuthService trainerAuthService,
            ILogger<AuthController> logger)
        {
            _adminAuthService = adminAuthService ?? throw new ArgumentNullException(nameof(adminAuthService));
            _gymOwnerAuthService = gymOwnerAuthService ?? throw new ArgumentNullException(nameof(gymOwnerAuthService));
            _trainerAuthService = trainerAuthService ?? throw new ArgumentNullException(nameof(trainerAuthService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Authenticates an Admin user and returns JWT token.
        /// </summary>
        /// <param name="request">Admin login credentials</param>
        /// <returns>Login response with JWT token on success</returns>
        /// <response code="200">Login successful, returns token</response>
        /// <response code="400">Invalid request model</response>
        /// <response code="401">Invalid credentials</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("admin/login")]
        [ProducesResponseType(typeof(AdminLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(AdminLoginResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AdminLoginResponseDto>> AdminLogin([FromBody] AdminLoginRequestDto request)
        {
            try
            {
                // Call authentication service
                var response = await _adminAuthService.LoginAsync(request);

                // Return appropriate status code based on success
                if (response.Success)
                {
                    _logger.LogInformation("Admin login successful for user: {UserName}", request.UserName);
                    return Ok(response);
                }
                else
                {
                    _logger.LogWarning("Admin login failed for user: {UserName}", request.UserName);
                    return Unauthorized(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Admin login for user: {UserName}", request.UserName);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new AdminLoginResponseDto
                    {
                        Success = false,
                        Message = "An error occurred during login"
                    });
            }
        }

        /// <summary>
        /// Authenticates a GymOwner (owner) and returns a JWT token.
        /// </summary>
        /// <param name="request">Login request with UserName and Password</param>
        /// <returns>Login response with JWT token if successful</returns>
        [HttpPost("owner/login")]
        [ProducesResponseType(typeof(GymOwnerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GymOwnerLoginResponseDto>> OwnerLogin([FromBody] GymOwnerLoginRequestDto request)
        {
            try
            {
                var response = await _gymOwnerAuthService.LoginAsync(request);
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

        /// <summary>
        /// Authenticates a Trainer and returns a JWT token.
        /// </summary>
        /// <param name="request">Login request with UserName and Password</param>
        /// <returns>Login response with JWT token if successful</returns>
        [HttpPost("trainer/login")]
        [ProducesResponseType(typeof(TrainerLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TrainerLoginResponseDto>> TrainerLogin([FromBody] TrainerLoginRequestDto request)
        {
            try
            {
                var response = await _trainerAuthService.LoginAsync(request);

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
