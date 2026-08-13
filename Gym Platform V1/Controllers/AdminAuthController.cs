using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Auth;
using Gym_Platform_V1.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    /// <summary>
    /// Admin authentication controller.
    /// Provides endpoint for Admin login.
    /// </summary>
    [ApiController]
    [Route("api/admin")]
    public class AdminAuthController : ControllerBase
    {
        private readonly IAdminAuthService _authService;
        private readonly ILogger<AdminAuthController> _logger;

        /// <summary>
        /// Initializes a new instance of the AdminAuthController class.
        /// </summary>
        /// <param name="authService">The authentication service</param>
        /// <param name="logger">The logger</param>
        public AdminAuthController(IAdminAuthService authService, ILogger<AdminAuthController> logger)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
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
        [HttpPost("login")]
        [ProducesResponseType(typeof(AdminLoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(AdminLoginResponseDto), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AdminLoginResponseDto>> Login([FromBody] AdminLoginRequestDto request)
        {

            try
            {
                // Call authentication service
                var response = await _authService.LoginAsync(request);

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

        //public async Task<ActionResult<Admin>> GetAdminById(int id)
        //{
        //    try
        //    {
        //        var admin = await _authService.GetAdminById(id);
        //        if (admin == null)
        //        {
        //            _logger.LogWarning("Admin with ID {AdminId} not found", id);
        //            return NotFound();
        //        }
        //        return Ok(admin);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error retrieving Admin with ID {AdminId}", id);
        //        return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the admin");
        //    }
        //}
    }
    
}
