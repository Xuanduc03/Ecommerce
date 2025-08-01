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

        Task DeleteReviewAsync(Guid reviewId, Guid userId);
    }

}
