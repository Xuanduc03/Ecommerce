using Microsoft.AspNetCore.Mvc;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace EcommerceBe.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
        }
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                var result = await _authService.LoginAsync(model);
                return Ok(new {
                    success = true,
                    messenge = "Đăng nhập thàng công",
                    token = result
                });

            }
            catch
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau."
                });
            }
        }
        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            try
            {
                await _authService.RequestRegisterAsync(model);
                return Ok(new
                {
                    success = true,
                    message = "Đăng ký thành công hãy đăng nhập"
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

       
        [HttpPost]
        [Route("forgot-password")]

        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            try
            {
                var success = await _authService.ForgotPasswordAsync(model);
                return Ok(new { Success = success, Message = "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Success = false, Message = "Đã xảy ra lỗi server. Vui lòng thử lại sau." });
            }
        }

        [HttpPost]
        [Route("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
        {
            try
            {
                var success = await _authService.ResetPasswordAsync(model);
                return Ok(new { Success = success, Message = "Mật khẩu đã được đặt lại thành công." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Success = false, Message = "Đã xảy ra lỗi server. Vui lòng thử lại sau." });
            }
        }


        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

                await _authService.ChangePasswordAsync(userId, model);

                return Ok( new 
                {
                    Success = true,
                    Message = "Đổi mật khẩu thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Lỗi hệ thống khi đổi mật khẩu"
                });
            }
        }
    }
}