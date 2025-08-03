using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EcommerceBe.Controllers
{
    [Route("api/review")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // POST: api/review
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body cannot be null." });

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user authentication." });

            try
            {
                await _reviewService.AddReviewAsync(userId, dto);
                return Ok(new { message = "Đánh giá đã được thêm thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // GET: api/review/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProduct(Guid productId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (productId == Guid.Empty)
                return BadRequest(new { message = "ProductId must not be empty." });

            try
            {
                var reviews = await _reviewService.GetReviewsByProductAsync(productId);
                return Ok(reviews);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // GET: api/review/user
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user authentication." });

            try
            {
                var reviews = await _reviewService.GetReviewsByUserAsync(userId);
                return Ok(reviews);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // GET: api/review/shop/{shopId}
        [HttpGet("shop/{shopId}")]
        [Authorize] // Chỉ seller hoặc admin được xem đánh giá của shop
        public async Task<IActionResult> GetReviewsByShop(Guid shopId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (shopId == Guid.Empty)
                return BadRequest(new { message = "ShopId must not be empty." });

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user authentication." });

            try
            {
                var reviews = await _reviewService.GetReviewsByShopAsync(shopId);
                return Ok(reviews);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // POST: api/review/reply
        [HttpPost("reply/{sellerId}")]
        public async Task<IActionResult> AddSellerReply(Guid sellerId,[FromBody] CreateReviewReplyDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body cannot be null." });

            try
            {
                await _reviewService.AddSellerReplyAsync(sellerId, dto);
                return Ok(new { message = "Phản hồi đã được thêm thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // DELETE: api/review/reply/{reviewId}
        [HttpDelete("reply/{reviewId}")]
        [Authorize(Roles = "Seller")] // Chỉ seller được xóa phản hồi
        public async Task<IActionResult> DeleteSellerReply(Guid reviewId)
        {
            if (reviewId == Guid.Empty)
                return BadRequest(new { message = "ReviewId must not be empty." });

            var sellerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerIdClaim) || !Guid.TryParse(sellerIdClaim, out var sellerId))
                return Unauthorized(new { message = "Invalid seller authentication." });

            try
            {
                await _reviewService.DeleteSellerReplyAsync(sellerId, reviewId);
                return Ok(new { message = "Phản hồi đã được xóa thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // DELETE: api/review/{reviewId}
        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(Guid reviewId)
        {
            if (reviewId == Guid.Empty)
                return BadRequest(new { message = "ReviewId must not be empty." });

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid user authentication." });

            try
            {
                await _reviewService.DeleteReviewAsync(reviewId, userId);
                return Ok(new { message = "Đánh giá đã được xóa." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}