using Gym_Management_System.Contexts;
using Gym_Management_System.Entities;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.DTOs.Member;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Service implementation for Member operations.
    /// Responsibility: Handle Member creation with Trainer context validation.
    /// </summary>
    public class MemberService : IMemberService
    {
        private readonly ILogger<MemberService> _logger;
        private readonly GymPlatformDbContext _context;

        public MemberService(ILogger<MemberService> logger, GymPlatformDbContext context)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <summary>
        /// Creates a new Member within the authenticated Trainer's Gym.
        /// A Trainer can only create Members in their own Gym.
        /// </summary>
        /// <param name="trainerId">The authenticated Trainer's ID from JWT claims</param>
        /// <param name="request">Member creation request with FullName and PhoneNumber</param>
        /// <returns>Created Member response DTO</returns>
        public async Task<MemberResponseDto> CreateMemberAsync(int trainerId, CreateMemberRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            _logger.LogInformation("Creating Member for Trainer: {TrainerId}", trainerId);

            //check Duplicate Member by phone within the same Gym
            var phoneExists = await _context.Members
         .AsNoTracking()
       .AnyAsync(m => m.PhoneNumber == request.PhoneNumber && m.TrainerId == trainerId);

            if (phoneExists)
            {
                _logger.LogWarning(
                    "Attempt to create Member with existing phone number: {PhoneNumber}",
                    request.PhoneNumber);

                throw new InvalidOperationException(
                    "A member with this phone number already exists.");
            }


            // Load the Trainer from database to get their GymId
            var trainer = await _context.Trainers
                .AsNoTracking()
                .Include(t => t.Gym)
                .FirstOrDefaultAsync(t => t.Id == trainerId);

            if (trainer == null)
            {
                _logger.LogWarning("Trainer not found: {TrainerId}", trainerId);
                throw new KeyNotFoundException($"Trainer with id {trainerId} not found.");
            }

            // Verify Trainer is active
            if (!trainer.IsActive)
            {
                _logger.LogWarning("Attempt to create Member for inactive Trainer: {TrainerId}", trainerId);
                throw new InvalidOperationException("Cannot create Member for an inactive Trainer.");
            }

            // Create Member with Trainer's GymId and TrainerId
            var member = new Member
            {
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                TrainerId = trainerId,   
                GymId = trainer.GymId,
               

            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Member created successfully. MemberId: {MemberId}, TrainerId: {TrainerId}, GymId: {GymId}", 
                member.Id, trainerId, trainer.GymId);

            // Return response with Member and Trainer information
            return new MemberResponseDto
            {
                Id = member.Id,
                FullName = member.FullName,
                PhoneNumber = member.PhoneNumber,
                CreatedAt = member.CreatedAt,
                TrainerId = member.TrainerId,
                GymId = member.GymId,
                TrainerName = trainer.FullName,
                gymName = trainer.Gym?.Name



            };
        }
    }
}
