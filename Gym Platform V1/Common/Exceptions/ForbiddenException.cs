namespace Gym_Platform_V1.Common.Exceptions
{
    // Represents an authorization/ownership failure: the caller is authenticated,
    // but is not permitted to access or act on the requested resource.
    // Mapped to HTTP 403 Forbidden by the controllers. Distinct from authentication
    // failures (missing/invalid JWT), which remain 401 Unauthorized.
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message)
            : base(message)
        {
        }
    }
}
