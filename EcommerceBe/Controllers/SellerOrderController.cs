using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/seller")]
    [Authorize(Roles = "Seller")]
    public class SellerOrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public SellerOrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private Guid GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(idStr, out var id)
                ? id
                : throw new UnauthorizedAccessException("Invalid UserId");
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetSellerOrders()
        {
            try
            {
                var sellerId = GetCurrentUserId();
                var orders = await _orderService.GetSellerOrdersAsync(sellerId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var sellerId = GetCurrentUserId();
                await _orderService.UpdateSellerOrderStatusAsync(orderId, dto.Status, sellerId);
                return Ok(new { message = "Order status updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}