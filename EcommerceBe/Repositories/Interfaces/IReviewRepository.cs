using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        Task AddAsync(Review review);
        Task<List<Review>> GetByProductIdAsync(Guid productId);
        Task<List<Review>> GetByUserIdAsync(Guid userId);
        Task<Review?> GetByIdAsync(Guid reviewId);
        Task<Review?> GetByUserAndProductAsync(Guid userId, Guid productId);
        Task<List<Review>> GetByShopIdAsync(Guid shopId);
        Task AddSellerReplyAsync(Guid reviewId, string reply); // Thêm phản hồi
        Task DeleteSellerReplyAsync(Guid reviewId); // Xóa phản hồi
        Task DeleteAsync(Review review);
        Task SaveChangesAsync();
    }

}
