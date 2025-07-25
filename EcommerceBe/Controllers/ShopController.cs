using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

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

        [HttpGet("{shopId}")]
        public async Task<IActionResult> GetById(Guid shopId)
        {
            var shop = await _shopService.GetShopByIdAsync(shopId);
            return Ok(shop);
        }

        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetBySellerId(Guid sellerId)
        {
            var shop = await _shopService.GetShopBySellerIdAsync(sellerId);
            return Ok(shop);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shops = await _shopService.GetAllShopsAsync();
            return Ok(shops);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateShopDto dto)
        {
            if (dto.SellerId == Guid.Empty)
                return BadRequest(new { error = "SellerId is required" });

            try
            {
                await _shopService.CreateShopAsync(dto, dto.SellerId);
                return Ok(new { message = "Shop created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPut("{shopId}")]
        public async Task<IActionResult> Update([FromBody] UpdateShopDto dto)
        {
            await _shopService.UpdateShopAsync(dto);
            return Ok(new { message = "Shop updated successfully" });
        }

        [HttpDelete("{shopId}")]
        public async Task<IActionResult> Delete(Guid shopId)
        {
            await _shopService.DeleteShopAsync(shopId);
            return Ok(new { message = "Shop deleted successfully" });
        }
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImageCloud(
             IFormFile file,
             [FromForm] string imageType,  // Đọc từ form thay vì query
             [FromServices] Cloudinary cloudinary)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File ảnh không hợp lệ" });

            if (string.IsNullOrEmpty(imageType) || (imageType != "logo" && imageType != "banner"))
                return BadRequest(new { message = "imageType phải là 'logo' hoặc 'banner'" });

            // Upload lên Cloudinary
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "shop",
                PublicId = $"{imageType}_{Guid.NewGuid()}",
                Overwrite = false
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                var imageUrl = uploadResult.SecureUrl.ToString();

                return Ok(new
                {
                    logoUrl = imageType == "logo" ? imageUrl : null,
                    bannerUrl = imageType == "banner" ? imageUrl : null
                });
            }

            return StatusCode((int)uploadResult.StatusCode, new { message = "Lỗi khi upload lên Cloudinary" });
        }


    }
}
