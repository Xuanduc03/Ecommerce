using Microsoft.AspNetCore.Mvc;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using System.Security.Claims;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;

namespace EcommerceBe.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;
        public UserController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserIdFromToken();
            var profile = await _authService.GetProfileAsync(userId);
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto model)
        {
            var userId = GetUserIdFromToken();
            var result = await _authService.UpdateProfileAsync(userId, model);
            return Ok(new { success = result });
        }

        [HttpPost("upload-avatar")]
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
                    Folder = "user", 
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

        private Guid GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userIdClaim, out var userId)
                ? userId
                : throw new UnauthorizedAccessException("Invalid token");
        }
    }
}
