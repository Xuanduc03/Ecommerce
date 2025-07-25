using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/admin/sellers")]
    public class AdminSellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public AdminSellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        /// <summary>
        /// Lấy danh sách seller với phân trang và tìm kiếm
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSellers([FromQuery] string? search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _sellerService.GetSellersAsync(search, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving sellers.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết một seller
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSellerById(Guid id)
        {
            try
            {
                var seller = await _sellerService.GetSellerByIdAsync(id);
                if (seller == null) return NotFound(new { message = "Seller not found" });

                return Ok(seller);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving seller.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Tạo mới seller (dành cho admin hoặc request nội bộ)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSeller([FromBody] SellerDto model)
        {
            try
            {
                var success = await _sellerService.CreateSellerAsync(model);
                if (!success) return BadRequest(new { message = "Failed to create seller" });

                return Ok(new { message = "Seller created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating seller.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin seller
        /// </summary>
        [HttpPut("{sellerId}")]
        public async Task<IActionResult> UpdateSeller(Guid sellerId, [FromBody] SellerDto model)
        {
            try
            {
                var success = await _sellerService.UpdateSellerAsync(sellerId, model);
                if (!success) return NotFound(new { message = "Seller not found or update failed" });

                return Ok(new { message = "Seller updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating seller.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Xóa seller
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeller(Guid id)
        {
            try
            {
                var success = await _sellerService.DeleteSellerAsync(id);
                if (!success) return NotFound(new { message = "Seller not found or delete failed" });

                return Ok(new { message = "Seller deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting seller.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái seller (ví dụ: Approved, Rejected, Pending)
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] string newStatus)
        {
            try
            {
                var success = await _sellerService.UpdateSellerStatusAsync(id, newStatus);
                if (!success) return NotFound(new { message = "Seller not found or status update failed" });

                return Ok(new { message = $"Seller status updated to {newStatus}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating seller status.", detail = ex.Message });
            }
        }
    }
}
