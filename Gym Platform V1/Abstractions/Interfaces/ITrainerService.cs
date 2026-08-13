using Gym_Platform_V1.DTOs.Trainer;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface ITrainerService
    {
        Task<TrainerResponseDto> CreateTrainerAsync(int ownerId, CreateTrainerRequestDto request);
    }
}
