using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Trainer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    [ApiController]
    [Route("api/trainers")]
    public class TrainerController : ControllerBase
    {
        private readonly ITrainerService _trainerService;
        private readonly ILogger<TrainerController> _logger;

        public TrainerController(ITrainerService trainerService, ILogger<TrainerController> logger)
        {
            _trainerService = trainerService ?? throw new ArgumentNullException(nameof(trainerService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        [Authorize(Roles = "GymOwner")]
        [Route("create")]
        [ProducesResponseType(typeof(TrainerResponseDto), StatusCodes.Status201Created)]
        public async Task<ActionResult<TrainerResponseDto>> CreateTrainer([FromBody] CreateTrainerRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Request cannot be null");

                // Extract owner id from claims. Prefer explicit "OwnerId" claim, fallback to NameIdentifier
                var ownerIdClaim = User.FindFirst("OwnerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (ownerIdClaim == null || !int.TryParse(ownerIdClaim.Value, out var ownerId))
                {
                    return Unauthorized(new { message = "OwnerId claim missing or invalid" });
                }

                var created = await _trainerService.CreateTrainerAsync(ownerId, request);

                // Return 201 Created with created trainer. No public GET by id currently exists,
                // so return Created with empty location to indicate resource creation.
                return Created("", created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating trainer");
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Not found while creating trainer");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        /// <summary>
        /// Gets all Trainers belonging to the authenticated GymOwner's Gyms.
        /// Optionally filters by specific Gym.
        /// </summary>
        /// <param name="gymId">Optional Gym ID to filter trainers</param>
        /// <returns>List of trainers belonging to the owner</returns>
        [HttpGet]
        [Authorize(Roles = "GymOwner")]
        [ProducesResponseType(typeof(List<TrainerResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        
        public async Task<ActionResult<List<TrainerResponseDto>>> GetTrainers([FromQuery] int? gymId)
        {
            try
            {
                // Extract owner id from claims. Prefer explicit "OwnerId" claim, fallback to NameIdentifier
                var ownerIdClaim = User.FindFirst("OwnerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (ownerIdClaim == null || !int.TryParse(ownerIdClaim.Value, out var ownerId))
                {
                    _logger.LogWarning("OwnerId claim missing or invalid");
                    return Unauthorized(new { message = "OwnerId claim missing or invalid" });
                }

                _logger.LogInformation("Retrieving trainers for OwnerId: {OwnerId}, GymId: {GymId}", ownerId, gymId);

                var trainers = await _trainerService.GetTrainersAsync(ownerId, gymId);

                _logger.LogInformation("Retrieved {Count} trainers for OwnerId: {OwnerId}", trainers.Count, ownerId);

                return Ok(trainers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving trainers");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }
    }
}