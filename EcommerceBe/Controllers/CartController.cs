using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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

        // GET: /api/cart/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCart(Guid userId)
        {
            var items = await _cartService.GetCartItemsAsync(userId);
            return Ok(items);
        }

        // POST: /api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddOrUpdate([FromBody] AddToCartRequest request)
        {
            await _cartService.AddOrUpdateCartItemAsync(request.UserId, request.ProductVariantId, request.Quantity);
            return Ok(new { message = "Item added/updated to cart" });
        }

        // DELETE: /api/cart/{userId}/item/{cartItemId}
        [HttpDelete("{userId}/item/{cartItemId}")]
        public async Task<IActionResult> Remove(Guid userId, Guid cartItemId)
        {
            await _cartService.RemoveCartItemAsync(userId, cartItemId);
            return Ok(new { message = "Item removed from cart" });
        }

        // DELETE: /api/cart/{userId}/clear
        [HttpDelete("{userId}/clear")]
        public async Task<IActionResult> Clear(Guid userId)
        {
            await _cartService.ClearCartAsync(userId);
            return Ok(new { message = "Cart cleared" });
        }
        // get user id current
        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdStr, out var userId)
                ? userId
                : throw new UnauthorizedAccessException("Invalid user ID");
        }

        [HttpGet("total")]
        [Authorize]
        public async Task<IActionResult> GetTotal()
        {
            var userId = GetCurrentUserId();
            var items = await _cartService.GetCartItemsAsync(userId);
            var total = items.Sum(i => i.Price * i.Quantity);
            return Ok(new { total });
        }

    }
}
