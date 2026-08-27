namespace Gym_Platform_V1.DTOs.Member
{
    /// <summary>
    /// Request for updating a Member's basic information.
    /// Only FullName and PhoneNumber can be updated — the Member stays
    /// with the same Trainer and Gym. MemberId comes from the route and
    /// TrainerId comes from the authenticated JWT, so neither appears here.
    /// </summary>
    public class UpdateMemberRequestDto
    {
        /// <summary>
        /// Member's full name.
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Member's phone number. Must be unique within the same Gym.
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
