using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class ShopRepository : IShopRepository
    {
        private readonly AppDbContext _context;
        public ShopRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Shop?> GetByIdAsync(Guid shopId)
        {
            return await _context.Shops
                .Include(x => x.Products)
                .FirstOrDefaultAsync(x => x.ShopId == shopId);
        }
        public async Task<Shop?> GetBySellerIdAsync(Guid sellerId)
        {
            return await _context.Shops.Include(s => s.Products).FirstOrDefaultAsync(x => x.SellerId == sellerId);
        }
        public async Task<List<Shop>> GetAllAsync()
        {
            return await _context.Shops
                .Include(s => s.Products)
                .Include(s => s.Seller)
                    .ThenInclude(u => u.User)
                .ToListAsync();
        }
        public async Task AddAsync(Shop shop)
        {
            await _context.Shops.AddAsync(shop);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(Shop shop)
        {
            _context.Shops.Update(shop);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(Guid shopId)
        {
            var shop = await _context.Shops.FindAsync(shopId);
            if(shop != null)
            {
                _context.Shops.Remove(shop);
                await _context.SaveChangesAsync();
            }
            
        }
    }
}
