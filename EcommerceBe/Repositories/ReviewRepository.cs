using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EcommerceBe.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Review review)
        {
            if (review == null)
                throw new ArgumentNullException(nameof(review));

            if (review.ProductId == Guid.Empty || review.UserId == Guid.Empty)
                throw new ArgumentException("ProductId and UserId must not be empty.", nameof(review));

            _context.Reviews.Add(review);
            await SaveChangesAsync();
        }

        public async Task<List<Review>> GetByProductIdAsync(Guid productId)
        {
            if (productId == Guid.Empty)
                throw new ArgumentException("ProductId must not be empty.", nameof(productId));

            return await _context.Reviews
                .AsNoTracking()
                .Include(r => r.user)
                .Where(r => r.ProductId == productId)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId must not be empty.", nameof(userId));

            return await _context.Reviews
                .AsNoTracking()
                .Include(r => r.user)
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task<Review?> GetByIdAsync(Guid reviewId)
        {
            if (reviewId == Guid.Empty)
                throw new ArgumentException("ReviewId must not be empty.", nameof(reviewId));

            return await _context.Reviews
                .AsNoTracking()
                .Include(r => r.user)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public async Task<Review?> GetByUserAndProductAsync(Guid userId, Guid productId)
        {
            if (userId == Guid.Empty || productId == Guid.Empty)
                throw new ArgumentException("UserId and ProductId must not be empty.");

            return await _context.Reviews
                .AsNoTracking()
                .Include(r => r.user)
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId);
        }

        public async Task<List<Review>> GetByShopIdAsync(Guid shopId)
        {
            if (shopId == Guid.Empty)
                throw new ArgumentException("ShopId must not be empty.", nameof(shopId));

            return await _context.Reviews
                .AsNoTracking()
                .Include(r => r.user)
                .Include(r => r.product)
                .Where(r => r.product.ShopId == shopId)
                .ToListAsync();
        }

        public async Task DeleteAsync(Review review)
        {
            if (review == null)
                throw new ArgumentNullException(nameof(review));

            var existingReview = await _context.Reviews.FindAsync(review.ReviewId);
            if (existingReview == null)
                throw new InvalidOperationException("Review not found.");

            _context.Reviews.Remove(existingReview);
            await SaveChangesAsync();
        }


        public async Task AddSellerReplyAsync(Guid reviewId, string reply)
        {
            if (reviewId == Guid.Empty)
                throw new ArgumentException("ReviewId must not be empty.", nameof(reviewId));
            if (string.IsNullOrWhiteSpace(reply))
                throw new ArgumentException("Reply cannot be empty.", nameof(reply));

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

            review.SellerReply = reply;
            review.SellerReplyAt = DateTime.UtcNow;
            await SaveChangesAsync();
        }

        public async Task DeleteSellerReplyAsync(Guid reviewId)
        {
            if (reviewId == Guid.Empty)
                throw new ArgumentException("ReviewId must not be empty.", nameof(reviewId));

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                throw new InvalidOperationException("Review not found.");

            review.SellerReply = null;
            review.SellerReplyAt = null;
            await SaveChangesAsync();
        }
        public async Task SaveChangesAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new InvalidOperationException("An error occurred while saving changes to the database.", ex);
            }
        }
    }
}