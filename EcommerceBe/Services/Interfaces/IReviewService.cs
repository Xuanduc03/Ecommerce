using EcommerceBe.Dto;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services.Interfaces
{
    public interface IReviewService
    {
        Task AddReviewAsync(Guid userId, CreateReviewDto dto);
        Task<List<ReviewDto>> GetReviewsByProductAsync(Guid productId);
        Task<List<ReviewDto>> GetReviewsByUserAsync(Guid userId);
        Task<List<ReviewDto>> GetReviewsByShopAsync(Guid shopId);
        Task AddSellerReplyAsync(Guid sellerId, CreateReviewReplyDto dto); // Thêm phản hồi
        Task DeleteSellerReplyAsync(Guid sellerId, Guid reviewId);
        Task DeleteReviewAsync(Guid reviewId, Guid userId);
    }

}
