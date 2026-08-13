using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.Entities;
using Gym_Platform_V1.optins;
using Gym_Management_System.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Gym_Platform_V1.Abstractions.Implemention.Services
{
    /// <summary>
    /// Token service implementation for JWT generation.
    /// Responsibility: Generate secure JWT tokens with claims.
    /// </summary>
    public class TokenService : ITokenService
    {

        private readonly ILogger<TokenService> _logger;
        private readonly IOptions<Jwtoptions> _jwtOptions;


        public TokenService( ILogger<TokenService> logger, IOptions<Jwtoptions> JwtOptions)
        {
            _jwtOptions = JwtOptions ?? throw new ArgumentNullException(nameof(JwtOptions));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));


        }

        /// <summary>
        /// Generates a JWT token for the given Admin user.
        /// </summary>
        /// <param name="admin">The Admin entity to generate token for</param>
        /// <returns>JWT token string</returns>
        /// <exception cref="InvalidOperationException">Thrown when JWT configuration is missing</exception>
        public string GenerateToken(Admin admin)
        {
            if (admin == null)
            {
                throw new ArgumentNullException(nameof(admin), "Admin cannot be null");
            }

            try
            {
                // Get JWT configuration from appsettings.json
                var key = _jwtOptions.Value.Key;
                var issuer = _jwtOptions.Value.Issuer;
                var audience = _jwtOptions.Value.Audience;
                var expireMinutes = _jwtOptions.Value.ExpireMinutes;

                // Validate configuration
                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
                {
                    throw new InvalidOperationException("JWT configuration is missing in appsettings.json");
                }

              if( expireMinutes <= 0)
                {
                    throw new InvalidOperationException("JWT expiration time must be a positive integer");
                }

                // Create symmetric security key
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                // Create claims with user information
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                    new Claim(ClaimTypes.Name, admin.UserName ?? string.Empty),
                    new Claim(ClaimTypes.Email, admin.Email ?? string.Empty),
                    new Claim("FullName", admin.FullName ?? string.Empty),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                // Create JWT token
                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                    signingCredentials: signingCredentials
                );

                // Write token to string
                var tokenHandler = new JwtSecurityTokenHandler();
                string jwtToken = tokenHandler.WriteToken(token);

                _logger.LogInformation("JWT token generated successfully for Admin: {AdminId}", admin.Id);
                return jwtToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for Admin: {AdminId}", admin.Id);
                throw;
            }
        }

        /// <summary>
        /// Generates a JWT token for the given Trainer user.
        /// </summary>
        /// <param name="trainer">The Trainer entity to generate token for</param>
        /// <returns>JWT token string</returns>
        /// <exception cref="InvalidOperationException">Thrown when JWT configuration is missing</exception>
        public string GenerateToken(Trainer trainer)
        {
            if (trainer == null)
            {
                throw new ArgumentNullException(nameof(trainer), "Trainer cannot be null");
            }

            try
            {
                // Get JWT configuration from appsettings.json
                var key = _jwtOptions.Value.Key;
                var issuer = _jwtOptions.Value.Issuer;
                var audience = _jwtOptions.Value.Audience;
                var expireMinutes = _jwtOptions.Value.ExpireMinutes;

                // Validate configuration
                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
                {
                    throw new InvalidOperationException("JWT configuration is missing in appsettings.json");
                }

                if (expireMinutes <= 0)
                {
                    throw new InvalidOperationException("JWT expiration time must be a positive integer");
                }

                // Create symmetric security key
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                // Create claims with user information
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, trainer.Id.ToString()),
                    new Claim(ClaimTypes.Name, trainer.UserName ?? string.Empty),
                    new Claim("FullName", trainer.FullName ?? string.Empty),
                    new Claim("GymId", trainer.GymId.ToString()),
                    new Claim(ClaimTypes.Role, "Trainer")
                };

                // Create JWT token
                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                    signingCredentials: signingCredentials
                );

                // Write token to string
                var tokenHandler = new JwtSecurityTokenHandler();
                string jwtToken = tokenHandler.WriteToken(token);

                _logger.LogInformation("JWT token generated successfully for Trainer: {TrainerId}", trainer.Id);
                return jwtToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for Trainer: {TrainerId}", trainer.Id);
                throw;
            }
        }

        /// <summary>
        /// Generates a JWT token for the given GymOwner user.
        /// </summary>
        /// <param name="gymOwner">The GymOwner entity to generate token for</param>
        /// <returns>JWT token string</returns>
        public string GenerateToken(GymOwner gymOwner)
        {
            if (gymOwner == null)
                throw new ArgumentNullException(nameof(gymOwner));

            try
            {
                var key = _jwtOptions.Value.Key;
                var issuer = _jwtOptions.Value.Issuer;
                var audience = _jwtOptions.Value.Audience;
                var expireMinutes = _jwtOptions.Value.ExpireMinutes;

                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
                {
                    throw new InvalidOperationException("JWT configuration is missing in appsettings.json");
                }

                if (expireMinutes <= 0)
                {
                    throw new InvalidOperationException("JWT expiration time must be a positive integer");
                }

                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
                var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new List<Claim>
                {
                    // Keep existing convention (NameIdentifier) and also include an explicit OwnerId claim
                    // to make it easy to extract by controllers that expect "OwnerId".
                    new Claim(ClaimTypes.NameIdentifier, gymOwner.Id.ToString()),
                    new Claim("OwnerId", gymOwner.Id.ToString()),
                    new Claim(ClaimTypes.Name, gymOwner.UserName ?? string.Empty),
                    new Claim(ClaimTypes.Email, gymOwner.Email ?? string.Empty),
                    new Claim("FullName", gymOwner.FullName ?? string.Empty),
                    new Claim(ClaimTypes.Role, "GymOwner")
                };

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                    signingCredentials: signingCredentials
                );

                var tokenHandler = new JwtSecurityTokenHandler();
                string jwtToken = tokenHandler.WriteToken(token);

                _logger.LogInformation("JWT token generated successfully for GymOwner: {GymOwnerId}", gymOwner.Id);
                return jwtToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for GymOwner: {GymOwnerId}", gymOwner.Id);
                throw;
            }
        }
    }
}
