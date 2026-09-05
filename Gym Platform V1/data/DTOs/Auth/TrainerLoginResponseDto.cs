namespace Gym_Platform_V1.data.DTOs.Auth
{
    /// <summary>
    /// Data Transfer Object for Trainer login response.
    /// Contains authentication result, token, and trainer information.
    /// </summary>
    public class TrainerLoginResponseDto
    {
        /// <summary>
        /// Gets or sets a value indicating whether login was successful.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Gets or sets the response message.
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Gets or sets the JWT token (only populated on successful login).
        /// </summary>
        public string? Token { get; set; }

        /// <summary>
        /// Gets or sets the logged-in Trainer information (only populated on successful login).
        /// </summary>
        public TrainerInfo? Trainer { get; set; }

        /// <summary>
        /// Nested class containing basic Trainer information for response.
        /// </summary>
        public class TrainerInfo
        {
            /// <summary>
            /// Gets or sets the Trainer ID.
            /// </summary>
            public int Id { get; set; }

            /// <summary>
            /// Gets or sets the Trainer's full name.
            /// </summary>
            public string? FullName { get; set; }

            /// <summary>
            /// Gets or sets the Trainer's username.
            /// </summary>
            public string? UserName { get; set; }

            /// <summary>
            /// Gets or sets the Gym ID this Trainer belongs to.
            /// </summary>
            public int GymId { get; set; }
        }
    }
}
