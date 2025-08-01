using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddReviewAsync(Guid userId, CreateReviewDto dto)
        {
            var review = new Review
            {
                ReviewId = Guid.NewGuid(),
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreateAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ReviewDto>> GetReviewsByProductAsync(Guid productId)
        {
            return await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    UserName = r.user.Username,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreateAt = r.CreateAt
                })
                .ToListAsync();
        }

        public async Task<List<ReviewDto>> GetReviewsByUserAsync(Guid userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreateAt = r.CreateAt
                })
                .ToListAsync();
        }

        public async Task<List<ReviewDto>> GetReviewsByShopAsync(Guid shopId)
        {
            return await _context.Reviews
                .Where(r => r.product.ShopId == shopId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    UserName = r.user.Username,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreateAt = r.CreateAt
                })
                .ToListAsync();
        }



        public async Task DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId);
            if (review == null) throw new Exception("Không tìm thấy đánh giá");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

}
