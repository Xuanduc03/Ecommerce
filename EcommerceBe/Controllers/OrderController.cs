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

        // POST: /api/order
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var userId = GetCurrentUserId();
            var orderId = await _orderService.CreateOrderAsync(userId, dto);
            return Ok(new { message = "Order created successfully", orderId });
        }

        // GET: /api/order/{orderId}
        [HttpGet("{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrder(Guid orderId)
        {
            var userId = GetCurrentUserId();
            var isOwner = await _orderService.CheckOrderBelongsToUserAsync(orderId, userId);
            if (!isOwner) return Forbid();

            var order = await _orderService.GetOrderByIdAsync(orderId);
            return Ok(order);
        }

        // GET: /api/order/user
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserOrders()
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        // PUT: /api/order/{orderId}/status?status=Shipped
        [HttpPut("{orderId}/status")]
        [Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> UpdateStatus(Guid orderId, [FromQuery] string status)
        {
            await _orderService.UpdateOrderStatusAsync(orderId, status);
            return Ok(new { message = "Order status updated" });
        }

        // PUT: /api/order/{orderId}/cancel
        [HttpPut("{orderId}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(Guid orderId, [FromBody] CancelOrderDto dto)
        {
            var userId = GetCurrentUserId();
            var isOwner = await _orderService.CheckOrderBelongsToUserAsync(orderId, userId);
            if (!isOwner) return Forbid();

            await _orderService.CancelOrderAsync(orderId, dto.Reason);
            return Ok(new { message = "Order cancelled" });
        }
    }
}
