using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Gym_Platform_V1.Controllers
{
    // Dev-only endpoint, kept under the Admin prefix since it requires the Admin role.
    [Route("api/admin/test")]
    [ApiController]

    public class TestController : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Authorized");
        }
    }
}
