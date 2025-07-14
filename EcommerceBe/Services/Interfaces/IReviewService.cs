using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IReviewService
    {
        Task AddReviewAsync(Guid userId, CreateReviewDto dto);
        Task<List<ReviewDto>> GetReviewsByProductAsync(Guid productId);
        Task<List<ReviewDto>> GetReviewsByUserAsync(Guid userId);
        Task DeleteReviewAsync(Guid reviewId, Guid userId);
    }

}
