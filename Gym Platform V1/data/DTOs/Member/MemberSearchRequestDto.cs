namespace Gym_Platform_V1.data.DTOs.Member
{
    /// <summary>
    /// Optional search filters for listing the authenticated Trainer's Members.
    /// Both filters are optional; when omitted, all of the Trainer's Members are returned.
    /// </summary>
    public class MemberSearchRequestDto
    {
        /// <summary>
        /// Optional partial name filter applied to the Member's full name.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Optional exact phone number filter applied to the Member's phone number.
        /// </summary>
        public string? Phone { get; set; }
    }
}
