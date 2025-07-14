using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    public class BaseController : ControllerBase
    {
        protected Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User is not authenticated.");

            return Guid.Parse(userIdClaim);
        }
    }
}
