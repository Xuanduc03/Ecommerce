using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task AddAsync(Review review)
        {
            _context.Reviews.Add(review);
            return Task.CompletedTask;
        }

        public Task<List<Review>> GetByProductIdAsync(Guid productId)
        {
            return _context.Reviews
                .Include(r => r.user)
                .Where(r => r.ProductId == productId)
                .ToListAsync();
        }

        public Task<List<Review>> GetByUserIdAsync(Guid userId)
        {
            return _context.Reviews
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public Task<Review?> GetByIdAsync(Guid reviewId)
        {
            return _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public Task<Review?> GetByUserAndProductAsync(Guid userId, Guid productId)
        {
            return _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId);
        }

        public Task DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }
    }

}
