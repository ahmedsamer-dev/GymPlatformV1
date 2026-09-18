using Gym_Platform_V1.Entities;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    public sealed class AuthTokenResult
    {
        public string AccessToken { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
    }

    public sealed class AuthRotationResult
    {
        public AuthTokenResult? Tokens { get; private init; }
        public string? ErrorMessage { get; private init; }
        public bool Succeeded => Tokens != null;

        public static AuthRotationResult Success(AuthTokenResult tokens) => new() { Tokens = tokens };
        public static AuthRotationResult Failure(string? errorMessage = null) => new() { ErrorMessage = errorMessage };
    }

    public interface IAuthSessionService
    {
        Task<AuthTokenResult> IssueAsync(User user, int domainId, string? fullName, string? email, int? gymId = null);
        Task<AuthRotationResult> RotateAsync(string rawRefreshToken);
        Task<bool> RevokeAsync(string rawRefreshToken);
    }
}