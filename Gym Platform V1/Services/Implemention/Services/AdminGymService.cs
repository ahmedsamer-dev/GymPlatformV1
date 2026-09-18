using Gym_Management_System.Contexts;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.data.DTOs.Admin.Common;
using Gym_Platform_V1.data.DTOs.Admin.Gyms;
using Microsoft.EntityFrameworkCore;

namespace Gym_Platform_V1.Abstractions.Implemention.Services;

public class AdminGymService : IAdminGymService
{
    private readonly GymPlatformDbContext _dbContext;
    private readonly ILogger<AdminGymService> _logger;

    public AdminGymService(GymPlatformDbContext dbContext, ILogger<AdminGymService> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<PagedResponseDto<GymListResponseDto>> GetPagedAsync(GymListRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var query = _dbContext.Gyms
            .AsNoTracking()
            .AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(g => g.IsActive == request.IsActive.Value);

        if (request.OwnerId.HasValue)
            query = query.Where(g => g.GymOwnerID == request.OwnerId.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(g => g.Name!.Contains(search)
                || g.Address!.Contains(search)
                || g.PhoneNumber!.Contains(search)
                || g.GymOwner!.FullName!.Contains(search)
                || g.GymOwner.Email!.Contains(search));
        }

        var descending = !string.Equals(request.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        query = request.SortBy?.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(g => g.Name) : query.OrderBy(g => g.Name),
            "ownername" => descending ? query.OrderByDescending(g => g.GymOwner!.FullName) : query.OrderBy(g => g.GymOwner!.FullName),
            "trainercount" => descending ? query.OrderByDescending(g => g.Trainers.Count) : query.OrderBy(g => g.Trainers.Count),
            "membercount" => descending ? query.OrderByDescending(g => g.Members.Count) : query.OrderBy(g => g.Members.Count),
            _ => descending ? query.OrderByDescending(g => g.CreatedAt) : query.OrderBy(g => g.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(g => new GymListResponseDto
            {
                Id = g.Id,
                Name = g.Name ?? string.Empty,
                Address = g.Address ?? string.Empty,
                PhoneNumber = g.PhoneNumber ?? string.Empty,
                OwnerId = g.GymOwnerID,
                OwnerName = g.GymOwner!.FullName ?? string.Empty,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt,
                TrainerCount = g.Trainers.Count,
                MemberCount = g.Members.Count
            })
            .ToListAsync();

        return new PagedResponseDto<GymListResponseDto>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<GymDetailsResponseDto?> GetDetailsAsync(int id)
    {
        if (id <= 0)
            return null;

        return await _dbContext.Gyms
            .AsNoTracking()
            .Where(g => g.Id == id)
            .Select(g => new GymDetailsResponseDto
            {
                Id = g.Id,
                Name = g.Name ?? string.Empty,
                Address = g.Address ?? string.Empty,
                PhoneNumber = g.PhoneNumber ?? string.Empty,
                OwnerId = g.GymOwnerID,
                OwnerName = g.GymOwner!.FullName ?? string.Empty,
                OwnerEmail = g.GymOwner.Email ?? string.Empty,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt,
                TrainerCount = g.Trainers.Count,
                MemberCount = g.Members.Count,
                MembershipPlanCount = g.MembershipPlans.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task SetStatusAsync(int id, bool active)
    {
        if (id <= 0)
            throw new ArgumentException("Gym ID must be greater than 0", nameof(id));

        var gym = await _dbContext.Gyms.FirstOrDefaultAsync(g => g.Id == id);
        if (gym is null)
            throw new KeyNotFoundException($"Gym with id {id} not found.");

        if (gym.IsActive == active)
            throw new InvalidOperationException($"Gym is already {(active ? "active" : "inactive")}.");

        gym.IsActive = active;
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Gym status changed. GymId: {GymId}, Active: {Active}", id, active);
    }
}
