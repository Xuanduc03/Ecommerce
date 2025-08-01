using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _reviewService.AddReviewAsync(userId, dto);
                return Ok(new { message = "Đánh giá đã được thêm thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/review/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProduct(Guid productId)
        {
            var reviews = await _reviewService.GetReviewsByProductAsync(productId);
            return Ok(reviews);
        }

        // GET: api/review/user
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserReviews()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var reviews = await _reviewService.GetReviewsByUserAsync(userId);
            return Ok(reviews);
        }

        // Lấy đánh giá của shop
        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetReviewsByShop(Guid shopId)
        {
            var result = await _reviewService.GetReviewsByShopAsync(shopId);
            return Ok(result);
        }

        // DELETE: api/review/{reviewId}
        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(Guid reviewId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _reviewService.DeleteReviewAsync(reviewId, userId);
                return Ok(new { message = "Đánh giá đã được xoá." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
