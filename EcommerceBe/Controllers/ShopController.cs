using EcommerceBe.Models;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/shop")]
    public class ShopController : ControllerBase
    {

        private readonly IShopService _shopService;


        public ShopController(IShopService shopService)
        {
            _shopService = shopService;
        }

        // GET: /api/shop/{shopId}
        [HttpGet("{shopId}")]
        public async Task<IActionResult> GetById(Guid shopId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            return Ok(shop);
        }

        // GET: /api/shop/seller/{sellerId}
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetBySellerId(Guid sellerId)
        {
            var shop = await _shopService.GetShopBySellerIdAsync(sellerId);
            return Ok(shop);
        }

        // GET: /api/shop
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shops = await _shopService.GetAllShopsAsync();
            return Ok(shops);
        }

        // POST: /api/shop?sellerId=...
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Shop shop, [FromQuery] Guid sellerId)
        {
            await _shopService.CreateShopAsync(shop, sellerId);
            return Ok(new { message = "Shop created successfully" });
        }

        // PUT: /api/shop?sellerId=...
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Shop shop, [FromQuery] Guid sellerId)
        {
            await _shopService.UpdateShopAsync(shop, sellerId);
            return Ok(new { message = "Shop updated successfully" });
        }

        // DELETE: /api/shop/{shopId}?sellerId=...
        [HttpDelete("{shopId}")]
        public async Task<IActionResult> Delete(Guid shopId, [FromQuery] Guid sellerId)
        {
            await _shopService.DeleteShopAsync(shopId, sellerId);
            return Ok(new { message = "Shop deleted successfully" });
        }
    }
}
