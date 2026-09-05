using Gym_Platform_V1.data.DTOs.Trainer;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public interface ITrainerService
    {
        Task<TrainerResponseDto> CreateTrainerAsync(int ownerId, CreateTrainerRequestDto request);
        Task<List<TrainerResponseDto>> GetTrainersAsync(
    int ownerId,
    int? gymId);
        Task<TrainerResponseDto> UpdateTrainerAsync(int ownerId, int trainerId, UpdateTrainerRequestDto request, int? gymId);
        Task<TrainerResponseDto?> GetTrainerByIdAsync(int ownerId, int trainerId);
        Task SetTrainerStatusAsync(
    int ownerId,
    int trainerId,
    bool active);
    }
}
