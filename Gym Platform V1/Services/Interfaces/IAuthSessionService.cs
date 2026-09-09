using Gym_Platform_V1.Entities;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public sealed class AuthTokenResult
    {
        public string AccessToken { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
    }

    public interface IAuthSessionService
    {
        Task<AuthTokenResult> IssueAsync(User user, int domainId, string? fullName, string? email, int? gymId = null);
        Task<AuthTokenResult?> RotateAsync(string rawRefreshToken);
        Task<bool> RevokeAsync(string rawRefreshToken);
    }
}