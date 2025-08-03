using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/seller")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;
        private readonly ISellerRepository _sellerRepository;
        private readonly IShopRepository _shopRepository;

        public SellerController(ISellerService sellerService, ISellerRepository sellerRepository, IShopRepository shopRepository)
        {
            _sellerService = sellerService;
            _sellerRepository = sellerRepository;
            _shopRepository = shopRepository;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentSeller()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            Guid.TryParse(userIdClaim, out var userId);
            var seller = await _sellerRepository.GetByUserIdAsync(userId);

            if (seller == null) return NotFound();

            var result = new
            {
                seller.SellerId,
                seller.Shop?.ShopId,
                seller.Shop?.ShopName,
                User = new { seller.User.UserId, seller.User.Email }
            };

            return Ok(result);
        }




        [HttpGet("shops/{sellerId}")]
        public async Task<IActionResult> GetShopBySellerId(string sellerId)
        {
            if (!Guid.TryParse(sellerId, out var sellerGuid))
                return BadRequest(new { message = "SellerId không hợp lệ." });

            var shop = await _shopRepository.GetBySellerIdAsync(sellerGuid);

            if (shop == null)
                return NotFound(new { message = "Seller chưa có shop." });

            return Ok(shop);
        }

        [HttpGet("shop")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> GetCurrentSellerShop()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            Guid.TryParse(userIdClaim, out var userId);
            var seller = await _sellerRepository.GetByUserIdAsync(userId);

            if (seller == null) return NotFound();

            var shop = await _shopRepository.GetBySellerIdAsync(seller.SellerId);

            if (shop == null)
                return NotFound(new { message = "Seller chưa có shop." });

            return Ok(shop);
        }


    }
}
