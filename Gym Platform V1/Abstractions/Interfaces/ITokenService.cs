using Gym_Platform_V1.Entities;

namespace Gym_Platform_V1.Abstractions.Interfaces
{
    /// <summary>
    /// Token service interface for JWT generation.
    /// Responsibility: Generate secure JWT tokens for authenticated users.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generates a JWT token for the given Admin user.
        /// </summary>
        /// <param name="admin">The Admin entity to generate token for</param>
        /// <returns>JWT token string</returns>
        string GenerateToken(Admin admin);
    }
}
