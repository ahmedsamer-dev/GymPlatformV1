using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.Entities;
using Gym_Platform_V1.optins;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    public class TokenService : ITokenService
    {
        private readonly IOptions<Jwtoptions> _jwtOptions;

        public TokenService(IOptions<Jwtoptions> jwtOptions)
        {
            _jwtOptions = jwtOptions ?? throw new ArgumentNullException(nameof(jwtOptions));
        }

        public string GenerateAccessToken(User user, int domainId, string? fullName, string? email, int? gymId = null)
        {
            ArgumentNullException.ThrowIfNull(user);
            var options = _jwtOptions.Value;
            if (string.IsNullOrWhiteSpace(options.Key) || string.IsNullOrWhiteSpace(options.Issuer) || string.IsNullOrWhiteSpace(options.Audience))
                throw new InvalidOperationException("JWT configuration is missing.");
            if (options.ExpireMinutes <= 0)
                throw new InvalidOperationException("JWT expiration time must be positive.");

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, domainId.ToString()),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Role, user.Role),
                new("FullName", fullName ?? string.Empty)
            };

            if (!string.IsNullOrWhiteSpace(email))
                claims.Add(new Claim(ClaimTypes.Email, email));
            if (user.Role == "GymOwner")
                claims.Add(new Claim("OwnerId", domainId.ToString()));
            if (user.Role == "Trainer" && gymId.HasValue)
                claims.Add(new Claim("GymId", gymId.Value.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: options.Issuer,
                audience: options.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(options.ExpireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}