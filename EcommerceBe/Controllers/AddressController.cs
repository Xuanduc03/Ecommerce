using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/address")]
    public class AddressController : ControllerBase
    {
        private readonly IShippingAddressService _service;

        public AddressController(IShippingAddressService service)
        {
            _service = service;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            var result = await _service.GetAddressesAsync(userId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
        {
            var userId = GetUserId();
            await _service.CreateAsync(userId, dto);
            return Ok(new { message = "Thêm địa chỉ thành công" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddressDto dto)
        {
            var userId = GetUserId();
            await _service.UpdateAsync(id, userId, dto);
            return Ok(new { message = "Cập nhật địa chỉ thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            await _service.DeleteAsync(id, userId);
            return Ok(new { message = "Xóa địa chỉ thành công" });
        }

        [HttpPut("{id}/default")]
        public async Task<IActionResult> SetDefault(Guid id)
        {
            var userId = GetUserId();
            await _service.SetDefaultAsync(id, userId);
            return Ok(new { message = "Cập nhật địa chỉ mặc định thành công" });
        }
    }
}
