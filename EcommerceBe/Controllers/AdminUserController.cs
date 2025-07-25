using EcommerceBe.Dto;
using EcommerceBe.Services;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUserController : ControllerBase
    {
        private readonly IAdminUserService _adminUserService;

        public AdminUserController(IAdminUserService adminUserService)
        {
            _adminUserService = adminUserService;
        }
        [HttpPost]
        [Route("create")]
        public async Task<IActionResult> CreateUser([FromBody] RegisterDto user)
        {
            try
            {
                await _adminUserService.CreateUserAsync(user);
                return Ok(new
                {
                    success = true,
                    message = "Tạo thành công"
                });
            }   
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau."
                });
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _adminUserService.GetUsersAsync(search, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _adminUserService.GetUserByIdAsync(id);
            return Ok(user);
        }
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] AdminUpdateUser model)
        {
            try
            {
                var result = await _adminUserService.UpdateUserAsync(userId, model);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra trong quá trình update. Vui lòng thử lại sau."
                });
            }
        }
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] string role)
        {
            await _adminUserService.UpdateUserRoleAsync(id, role);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var success = await _adminUserService.DeleteUserAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Người dùng không tồn tại." });
            }

            return Ok(new { message = "Xóa người dùng thành công." });
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
