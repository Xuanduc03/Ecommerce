using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/statistics")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        private Guid GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(idStr, out var id)
                ? id
                : throw new UnauthorizedAccessException("Invalid UserId");
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStatistics()
        {
            try
            {
                var statistics = await _statisticsService.GetAdminStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("seller/{sellerId}")]
        [Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> GetSellerStatistics(Guid sellerId)
        {
            try
            {
                // Nếu là seller, chỉ được xem thống kê của chính mình
                var currentUserId = GetCurrentUserId();
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                
                if (userRole == "Seller" && currentUserId != sellerId)
                {
                    return Forbid("You can only view your own statistics");
                }

                var statistics = await _statisticsService.GetSellerStatisticsAsync(sellerId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}