using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // GET: /api/cart/{userId} -> Lấy giỏ hàng chi tiết
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(Guid userId)
        {
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(cart);
        }

        // POST: /api/cart/add -> Thêm hoặc cập nhật item
        [HttpPost("add")]
        public async Task<IActionResult> AddOrUpdate([FromBody] AddToCartDto request)
        {
            var updatedCart = await _cartService.AddOrUpdateCartItemAsync(request.UserId, request.ProductVariantId, request.Quantity);
            return Ok(updatedCart);
        }

        // PUT: /api/cart/update -> Cập nhật số lượng item
        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartItemDto request)
        {
            var userId = GetCurrentUserId();
            var updatedCart = await _cartService.UpdateCartItemQuantityAsync(userId, request.CartItemId, request.Quantity);
            return Ok(updatedCart);
        }

        // DELETE: /api/cart/{userId}/item/{cartItemId} -> Xóa 1 item
        [HttpDelete("{userId}/item/{cartItemId}")]
        public async Task<IActionResult> Remove(Guid userId, Guid cartItemId)
        {
            await _cartService.RemoveCartItemAsync(userId, cartItemId);
            return Ok(new { message = "Item removed from cart" });
        }

        // DELETE: /api/cart/{userId}/clear -> Xóa toàn bộ giỏ hàng
        [HttpDelete("{userId}/clear")]
        public async Task<IActionResult> Clear(Guid userId)
        {
            await _cartService.ClearCartAsync(userId);
            return Ok(new { message = "Cart cleared" });
        }

        // GET: /api/cart/total -> Tổng giá trị giỏ hàng (dùng user hiện tại)
        [HttpGet("total")]
        [Authorize]
        public async Task<IActionResult> GetTotal()
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(new { total = cart.TotalPrice });
        }

        // Helper: Lấy UserId từ JWT
        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdStr, out var userId)
                ? userId
                : throw new UnauthorizedAccessException("Invalid user ID");
        }
    }
}
