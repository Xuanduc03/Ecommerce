using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class SellerRepository : ISellerRepository
    {
        private readonly AppDbContext _context;
        public SellerRepository(AppDbContext context)
        {
            _context = context;
        }
        // get all user 
        public async Task<List<Seller>> GetAllSellerAsync(string? search, int page, int pageSize)
        {
            var query = _context.Sellers.AsQueryable();

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

        }

        public async Task<Seller?> GetByIdAsync(Guid sellerId)
        {
            return await _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Shop)
                .FirstOrDefaultAsync(u => u.SellerId == sellerId);
        }

        public async Task<Seller?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Shop)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }


        // them user
        public async Task AddAsync(Seller seller)
        {
            await _context.Sellers.AddAsync(seller);
        }
        // cap nhat user
        public Task UpdateAsync(Seller seller)
        {
            _context.Sellers.Update(seller);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangeAsync()
        {
            return await _context.SaveChangesAsync();
        }
        // xóa người dùng only admin
        public async Task DeleteAsync(Guid sellerId)
        {
            var seller = await GetByIdAsync(sellerId);
            if (seller != null)
            {
                _context.Sellers.Remove(seller);
            }
        }

    }
}
