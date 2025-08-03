using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/order")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
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

        // === Buyer ===

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var userId = GetCurrentUserId();
            var orderId = await _orderService.CreateOrderAsync(userId, dto);
            return Ok(new { message = "Order created successfully", orderId });
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(Guid orderId)
        {
            var userId = GetCurrentUserId();
            var isOwner = await _orderService.CheckOrderBelongsToUserAsync(orderId, userId);
            if (!isOwner) return Forbid();

            var order = await _orderService.GetOrderByIdAsync(orderId);
            return Ok(order);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserOrders()
        {
            try
            {
                var userId = GetCurrentUserId();
                var orders = await _orderService.GetOrdersByUserIdAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("user/{orderId}")]
        public async Task<IActionResult> CancelUserOrder(Guid orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isOwner = await _orderService.CheckOrderBelongsToUserAsync(orderId, userId);
                if (!isOwner) return Forbid("You can only cancel your own orders");

                // Chỉ cho phép hủy đơn nếu trạng thái là "pending" hoặc "confirmed"
                var order = await _orderService.GetOrderByIdAsync(orderId);
                if (order.Status != "pending" && order.Status != "confirmed")
                {
                    return BadRequest(new { error = "Cannot cancel order in current status" });
                }

                await _orderService.CancelOrderAsync(orderId, "Cancelled by user");
                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetOrderByShop(Guid shopId)
        {
            try
            {
                var orders = await _orderService.GetOrdersByShopIdAsync(shopId);
                return Ok(orders);
            }catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // === Admin ===

        [HttpGet("")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrderAsync();
            return Ok(orders);
        }

        [HttpGet("admin/{orderId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrderByIdForAdmin(Guid orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            return Ok(order);
        }

        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrder(Guid orderId)
        {
            try
            {
                await _orderService.DeleteOrderAsync(orderId);
                return Ok(new { message = "Order deleted successfully" });
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPut("admin/{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminUpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                await _orderService.UpdateOrderStatusAsync(orderId, dto.Status);
                return Ok(new { message = "Order status updated by admin" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
