using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using FluentValidation.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/product")]
    public class ProductController : BaseController
    {
        private readonly IProductService _productService;

        // GET: /api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var product = await _productService.GetByIdAsync(id);
            return Ok(product);
        }

        // GET: /api/product/shop/{shopId}
        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetByShop(Guid shopId)
        {
            var products = await _productService.GetByShopIdAsync(shopId);
            return Ok(products);
        }

        // POST: /api/product
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            await _productService.CreateProductAsync(dto);
            return Ok(new { message = "Product created successfully" });
        }

        // PUT: /api/product/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateProductDto dto)
        {
            await _productService.UpdateProductAsync(id, dto);
            return Ok(new { message = "Product updated successfully" });
        }

        // DELETE: /api/product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _productService.DeleteProductAsync(id);
            return Ok(new { message = "Product deleted successfully" });
        }

        // POST: /api/product/search
        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] ProductFilterDto filter)
        {
            var result = await _productService.SearchProductsAsync(filter);
            return Ok(result);
        }

        // GET: /api/product/inventory?sellerId=...
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory([FromQuery] Guid sellerId)
        {
            var result = await _productService.GetInventoryBySellerAsync(sellerId);
            return Ok(result);
        }

        // POST: /api/product/explore
        [HttpPost("explore")]
        public async Task<IActionResult> Explore([FromBody] ProductQueryDto dto)
        {
            var result = await _productService.QueryProductsAsync(dto);
            return Ok(result);
        }
    }
}
