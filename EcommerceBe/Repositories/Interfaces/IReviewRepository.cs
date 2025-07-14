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
        Task DeleteAsync(Review review);
        Task SaveChangesAsync();
    }

}
