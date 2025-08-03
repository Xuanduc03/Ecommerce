using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IProductRepository _productRepository; 
        private readonly IUserRepository _userRepository;      

        public ReviewService(
            IReviewRepository reviewRepository,
            IProductRepository productRepository,
            IUserRepository userRepository)
        {
            _reviewRepository = reviewRepository;
            _productRepository = productRepository;
            _userRepository = userRepository;
        }

        public async Task AddReviewAsync(Guid userId, CreateReviewDto dto)
        {
            // Kiểm tra null và validation
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (dto.ProductId == Guid.Empty)
                throw new ArgumentException("ProductId must not be empty.", nameof(dto.ProductId));
            if (dto.Rating < 1 || dto.Rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5.", nameof(dto.Rating));

            // Kiểm tra UserId và ProductId có tồn tại
            var userExists = await _userRepository.GetByIdAsync(userId) != null;
            if (!userExists)
                throw new InvalidOperationException("User not found.");

            var productExists = await _productRepository.GetByIdAsync(dto.ProductId) != null;
            if (!productExists)
                throw new InvalidOperationException("Product not found.");

            // Kiểm tra xem user đã review sản phẩm này chưa
            var existingReview = await _reviewRepository.GetByUserAndProductAsync(userId, dto.ProductId);
            if (existingReview != null)
                throw new InvalidOperationException("User has already reviewed this product.");

            var review = new Review
            {
                ReviewId = Guid.NewGuid(),
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreateAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
        }

        public async Task<List<ReviewDto>> GetReviewsByProductAsync(Guid productId)
        {
            if (productId == Guid.Empty)
                throw new ArgumentException("ProductId must not be empty.", nameof(productId));

            var reviews = await _reviewRepository.GetByProductIdAsync(productId);
            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                UserName = r.user?.Username ?? "Unknown",
                ProductId = r.ProductId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreateAt = r.CreateAt,
                SellerReply = r.SellerReply,
                SellerReplyAt = r.SellerReplyAt,
            }).ToList();
        }

        public async Task<List<ReviewDto>> GetReviewsByUserAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId must not be empty.", nameof(userId));

            var reviews = await _reviewRepository.GetByUserIdAsync(userId);
            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                UserName = r.user?.Username ?? "Unknown",
                ProductId = r.ProductId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreateAt = r.CreateAt
            }).ToList();
        }

        public async Task<List<ReviewDto>> GetReviewsByShopAsync(Guid shopId)
        {
            if (shopId == Guid.Empty)
                throw new ArgumentException("ShopId must not be empty.", nameof(shopId));

            // Giả sử IReviewRepository có phương thức GetByShopIdAsync
            var reviews = await _reviewRepository.GetByShopIdAsync(shopId);
            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                UserId = r.UserId,
                UserName = r.user?.Username ?? "Unknown",
                ProductId = r.ProductId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreateAt = r.CreateAt
            }).ToList();
        }

        public async Task DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            if (reviewId == Guid.Empty || userId == Guid.Empty)
                throw new ArgumentException("ReviewId and UserId must not be empty.");

            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null || review.UserId != userId)
                throw new InvalidOperationException("Review not found or user is not authorized to delete this review.");

            await _reviewRepository.DeleteAsync(review);
        }


        public async Task AddSellerReplyAsync(Guid sellerId, CreateReviewReplyDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (dto.ReviewId == Guid.Empty)
                throw new ArgumentException("ReviewId must not be empty.", nameof(dto.ReviewId));
            if (string.IsNullOrWhiteSpace(dto.Reply))
                throw new ArgumentException("Reply cannot be empty.", nameof(dto.Reply));
            if (sellerId == Guid.Empty)
                throw new ArgumentException("SellerId must not be empty.", nameof(sellerId));

            var review = await _reviewRepository.GetByIdAsync(dto.ReviewId);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

         

            await _reviewRepository.AddSellerReplyAsync(dto.ReviewId, dto.Reply);
        }

        public async Task DeleteSellerReplyAsync(Guid sellerId, Guid reviewId)
        {
            if (reviewId == Guid.Empty)
                throw new ArgumentException("ReviewId must not be empty.", nameof(reviewId));
            if (sellerId == Guid.Empty)
                throw new ArgumentException("SellerId must not be empty.", nameof(sellerId));

            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

            await _reviewRepository.DeleteSellerReplyAsync(reviewId);
        }
    }

}
