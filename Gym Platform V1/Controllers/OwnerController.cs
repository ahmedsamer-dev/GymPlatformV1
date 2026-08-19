using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.MembershipPlan;
using Gym_Platform_V1.DTOs.Trainer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Gym_Platform_V1.Controllers
{
    // Controller for all operations performed by the GymOwner (actor = owner).
    // Covers Trainer management and MembershipPlan management for the owner's gyms.
    // Trainer management works on the Trainer entity via TrainerService;
    // MembershipPlan management works on the MembershipPlan entity via MembershipPlanService.
    [ApiController]
    [Route("api/owner")]
    [Authorize(Roles = "GymOwner")]
    public class OwnerController : ControllerBase
    {
        private readonly ITrainerService _trainerService;
        private readonly IMembershipPlanService _membershipPlanService;
        private readonly ILogger<OwnerController> _logger;

        public OwnerController(
            ITrainerService trainerService,
            IMembershipPlanService membershipPlanService,
            ILogger<OwnerController> logger)
        {
            _trainerService = trainerService ?? throw new ArgumentNullException(nameof(trainerService));
            _membershipPlanService = membershipPlanService ?? throw new ArgumentNullException(nameof(membershipPlanService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ============================================
        // TRAINER MANAGEMENT
        // ============================================

        [HttpPost("trainers")]
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

                return CreatedAtAction(nameof(GetTrainerById), new { trainerId = created.Id }, created);
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
        [HttpGet("trainers")]
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

        // PUT /api/owner/trainers/{trainerId}
        // PUT /api/owner/trainers/{trainerId}?gymId=7
        //
        // Updates a Trainer's editable fields. Optionally moves the Trainer to a different Gym
        // if the gymId query parameter is provided.
        //
        // ownerId comes exclusively from the JWT token — never from the client request.
        // This prevents an Owner from impersonating another Owner.
        [HttpPut("trainers/{trainerId}")]
        [ProducesResponseType(typeof(TrainerResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TrainerResponseDto>> UpdateTrainer(
            int trainerId,
            [FromQuery] int? gymId,
            [FromBody] UpdateTrainerRequestDto request)
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

                var updated = await _trainerService.UpdateTrainerAsync(ownerId, trainerId, request, gymId);

                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found while updating");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Validation failed while updating trainer");
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Authorization failed while updating trainer");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating trainer");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // GET /api/owner/trainers/{trainerId}
        //
        // Returns a single Trainer by Id, but ONLY if the Trainer belongs to a Gym
        // owned by the authenticated GymOwner.
        //
        // trainerId comes from the route.
        // ownerId comes exclusively from the JWT — never from the client.
        //
        // If the Trainer does not exist or belongs to another Owner, the response
        // is 404 Not Found. This avoids exposing information about other Owners' resources.
        [HttpGet("trainers/{trainerId}")]
        [ProducesResponseType(typeof(TrainerResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TrainerResponseDto>> GetTrainerById(int trainerId)
        {
            try
            {
                // ownerId is extracted from the JWT token, NOT from the client.
                var ownerIdClaim = User.FindFirst("OwnerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (ownerIdClaim == null || !int.TryParse(ownerIdClaim.Value, out var ownerId))
                {
                    return Unauthorized(new { message = "OwnerId claim missing or invalid" });
                }

                _logger.LogInformation("GetTrainerById requested by OwnerId: {OwnerId} for TrainerId: {TrainerId}", ownerId, trainerId);

                var trainer = await _trainerService.GetTrainerByIdAsync(ownerId, trainerId);

                if (trainer == null)
                {
                    return NotFound(new { message = $"Trainer with id {trainerId} not found." });
                }

                return Ok(trainer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving trainer by id");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
            }
        }

        // PATCH /api/owner/trainers/{trainerId}/status?active={bool}
        //
        // Sets a Trainer's active status (IsActive = true/false). Deactivation is NOT a hard delete:
        // the Trainer row stays in the database and the Trainer's Members are untouched.
        //
        // trainerId comes from the route.
        // ownerId comes exclusively from the JWT — never from the client.
        //
        // All ownership/business validation lives in the service layer; the controller
        // only translates exceptions into HTTP responses.
        [HttpPatch("trainers/{trainerId}/status")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetTrainerStatus(
    int trainerId,
    [FromQuery] bool active)
        {
            try
            {
                var ownerIdClaim =
                    User.FindFirst("OwnerId")
                    ?? User.FindFirst(ClaimTypes.NameIdentifier);

                if (ownerIdClaim == null ||
                    !int.TryParse(ownerIdClaim.Value, out var ownerId))
                {
                    _logger.LogWarning(
                        "OwnerId claim missing or invalid while changing Trainer status.");

                    return Unauthorized(new
                    {
                        message = "OwnerId claim missing or invalid"
                    });
                }

                await _trainerService.SetTrainerStatusAsync(
                    ownerId,
                    trainerId,
                    active);

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid Trainer status request.");
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Trainer not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid Trainer status operation.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unexpected error while changing Trainer status.");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred"
                    });
            }
        }

        // ============================================
        // MEMBERSHIP PLAN MANAGEMENT
        // ============================================

        // POST /api/owner/membership-plans
        //
        // Creates a MembershipPlan inside one of the authenticated Owner's Gyms.
        // The client supplies GymId (an Owner may own several Gyms), but the service
        // verifies the Gym belongs to the caller before creating anything.
        //
        // ownerId comes exclusively from the JWT token — never from the client.
        // This prevents an Owner from impersonating another Owner.
        [HttpPost("membership-plans")]
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
