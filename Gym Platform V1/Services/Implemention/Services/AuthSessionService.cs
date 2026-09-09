using System.Security.Cryptography;
using System.Text;
using Gym_Management_System.Contexts;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.Entities;
using Gym_Platform_V1.options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class AuthSessionService : IAuthSessionService
    {
        private readonly GymPlatformDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly IOptions<RefreshTokenOptions> _options;

        public AuthSessionService(GymPlatformDbContext dbContext, ITokenService tokenService, IOptions<RefreshTokenOptions> options)
        {
            _dbContext = dbContext;
            _tokenService = tokenService;
            _options = options;
        }

        public async Task<AuthTokenResult> IssueAsync(User user, int domainId, string? fullName, string? email, int? gymId = null)
        {
            var rawToken = GenerateRawToken();
            var refreshToken = new RefreshToken
            {
                TokenHash = HashToken(rawToken),
                CreatedOn = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(_options.Value.ExpireDays),
                User = user
            };
            _dbContext.RefreshTokens.Add(refreshToken);
            await _dbContext.SaveChangesAsync();
            return new AuthTokenResult
            {
                AccessToken = _tokenService.GenerateAccessToken(user, domainId, fullName, email, gymId),
                RefreshToken = rawToken
            };
        }

        public async Task<AuthTokenResult?> RotateAsync(string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                return null;

            var tokenHash = HashToken(rawRefreshToken);
            var storedToken = await _dbContext.RefreshTokens
                .Include(t => t.User).ThenInclude(u => u.Admin)
                .Include(t => t.User).ThenInclude(u => u.GymOwner)
                .Include(t => t.User).ThenInclude(u => u.Trainer)
                .SingleOrDefaultAsync(t => t.TokenHash == tokenHash);

            if (storedToken == null || !storedToken.IsActive || !storedToken.User.IsActive)
                return null;

            var user = storedToken.User;
            var profile = GetProfile(user);
            if (profile == null || !profile.IsActive)
                return null;

            storedToken.RevokedOn = DateTime.UtcNow;
            var rawNewToken = GenerateRawToken();
            _dbContext.RefreshTokens.Add(new RefreshToken
            {
                TokenHash = HashToken(rawNewToken),
                CreatedOn = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(_options.Value.ExpireDays),
                UserId = user.Id
            });
            await _dbContext.SaveChangesAsync();

            var accessToken = _tokenService.GenerateAccessToken(user, profile.DomainId, profile.FullName, profile.Email, profile.GymId);
            return new AuthTokenResult { AccessToken = accessToken, RefreshToken = rawNewToken };
        }

        public async Task<bool> RevokeAsync(string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                return false;
            var token = await _dbContext.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == HashToken(rawRefreshToken));
            if (token == null || !token.IsActive)
                return false;
            token.RevokedOn = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        private static string GenerateRawToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        private static string HashToken(string rawToken) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        private static ProfileInfo? GetProfile(User user) => user.Role switch
        {
            "Admin" when user.Admin != null => new(user.Admin.Id, user.Admin.FullName, user.Admin.Email, null, user.Admin.IsActive),
            "GymOwner" when user.GymOwner != null => new(user.GymOwner.Id, user.GymOwner.FullName, user.GymOwner.Email, null, user.GymOwner.IsActive),
            "Trainer" when user.Trainer != null => new(user.Trainer.Id, user.Trainer.FullName, null, user.Trainer.GymId, user.Trainer.IsActive),
            _ => null
        };

        private sealed record ProfileInfo(int DomainId, string? FullName, string? Email, int? GymId, bool IsActive);
    }
}