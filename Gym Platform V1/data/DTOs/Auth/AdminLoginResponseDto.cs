namespace Gym_Platform_V1.data.DTOs.Auth
{
    /// <summary>
    /// Data Transfer Object for Admin login response.
    /// Contains authentication result, token, and admin information.
    /// </summary>
    public class AdminLoginResponseDto
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
        /// Gets or sets the logged-in Admin information (only populated on successful login).
        /// </summary>
        public AdminInfo? Admin { get; set; }

        /// <summary>
        /// Nested class containing basic Admin information for response.
        /// </summary>
        public class AdminInfo
        {
            /// <summary>
            /// Gets or sets the Admin ID.
            /// </summary>
            public int Id { get; set; }

            /// <summary>
            /// Gets or sets the Admin's full name.
            /// </summary>
            public string? FullName { get; set; }

            /// <summary>
            /// Gets or sets the Admin's username.
            /// </summary>
            public string? UserName { get; set; }

            /// <summary>
            /// Gets or sets the Admin's email address.
            /// </summary>
            public string? Email { get; set; }
        }
    }
}
