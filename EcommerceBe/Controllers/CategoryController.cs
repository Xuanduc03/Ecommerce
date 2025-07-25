using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;
        private readonly IWebHostEnvironment _env;

        public CategoryController(ICategoryService categoryService, IWebHostEnvironment env)
        {
            _service = categoryService;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách danh mục", detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy danh mục" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh mục", detail = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.CreateAsync(dto);
                if (!result)
                    return BadRequest(new { message = "Không thể tạo danh mục" });

                return Ok(new { message = "Thêm danh mục thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thêm danh mục", detail = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy danh mục cần cập nhật" });

                return Ok(new { message = "Cập nhật danh mục thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật danh mục", detail = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy danh mục cần xóa" });

                return Ok(new { message = "Xóa danh mục thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa danh mục", detail = ex.Message });
            }
        }

        [HttpPost("upload-image-cloud")]
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
                    Folder = "categories", // thư mục trên Cloudinary
                    PublicId = Path.GetFileNameWithoutExtension(Path.GetRandomFileName()), // tránh trùng tên
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
