using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/product")]
    public class ProductController : BaseController
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var products = await _productService.GetAllProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi ko thể lấy được");
            }
        }

        // GET: /api/product/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                return Ok(product);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        // GET: /api/product/shop/{shopId}
        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetByShop(Guid shopId)
        {
            try
            {
                var products = await _productService.GetByShopIdAsync(shopId);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get products by shop", details = ex.Message });
            }
        }

        // POST: /api/product
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            try
            {
                await _productService.CreateProductAsync(dto);
                return Ok(new { message = "Product created successfully" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create product", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
        {
            try
            {
                await _productService.UpdateProductAsync(id, dto);
                return Ok(new { message = "Product updated successfully" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                string inner = ex.InnerException?.ToString() ?? "";
                return StatusCode(500, new
                {
                    message = "Failed to update product",
                    details = ex.Message,
                    innerException = inner
                });
            }
        }

        // đề xuất sản phẩm theo danh mục 
        [HttpGet("suggested-by-category/{categoryId}")]
        public async Task<IActionResult> GetSuggestedProductsByCategory(Guid categoryId, [FromQuery] int count = 10)
        {
            try
            {
                var result = await _productService.GetTopProductsByCategoryAsync(categoryId, count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        // DELETE: /api/product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _productService.DeleteProductAsync(id);
                return Ok(new { message = "Product deleted successfully" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete product", details = ex.Message });
            }
        }

        // POST: /api/product/search
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            try
            {
                var result = await _productService.SearchProductsAsync(keyword);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to search products", details = ex.Message });
            }
        }


        // GET: /api/product/inventory?sellerId=...
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory([FromQuery] Guid sellerId)
        {
            try
            {
                var result = await _productService.GetInventoryBySellerAsync(sellerId);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch inventory", details = ex.Message });
            }
        }

        // POST: /api/product/explore
        [HttpPost("explore")]
        public async Task<IActionResult> Explore([FromBody] ProductQueryDto dto)
        {
            try
            {
                var result = await _productService.QueryProductsAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to explore products", details = ex.Message });
            }

        }

        [HttpGet("by-category/{categoryId}")]
        public async Task<IActionResult> GetProductsByCategory(Guid categoryId)
        {
            try
            {
                var products = await _productService.GetProductsByCategoryAsync(categoryId);
                return Ok((products));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to explore products", details = ex.Message });
            }

        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImageCloud(IFormFile file, [FromServices] Cloudinary cloudinary)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File ảnh không hợp lệ" });
            try
            {
                await using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "products", 
                    PublicId = Path.GetFileNameWithoutExtension(Path.GetRandomFileName()),
                    Overwrite = false
                };
                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    return Ok(new { imageUrl = uploadResult.SecureUrl.ToString() });
                }
                return StatusCode((int)uploadResult.StatusCode, new { message = "Lỗi khi upload lên Cloudinary" });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi khi upload ảnh lên Cloudinary",
                    detail = ex.Message
                });
            }
        }
    }
}
