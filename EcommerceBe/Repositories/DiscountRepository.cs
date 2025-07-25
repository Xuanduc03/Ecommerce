using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class DiscountRepository : IDiscountRepository
    {
        private readonly AppDbContext _context;

        public DiscountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Discount>> GetAllAsync(Guid? shopId = null)
        {
            var query = _context.Discounts
                .Include(d => d.Shop)
                .Include(d => d.Order)
                .AsQueryable();

            if (shopId.HasValue)
            {
                query = query.Where(d => d.ShopId == shopId);
            }

            return await query.ToListAsync();
        }

        public async Task<Discount> GetByIdAsync(Guid discountId)
        {
            return await _context.Discounts
                .Include(d => d.Shop)
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.DiscountId == discountId);
        }

        public async Task<Discount> CreateAsync(Discount discount)
        {
            discount.DiscountId = Guid.NewGuid();
            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();
            return discount;
        }

        public async Task<Discount> UpdateAsync(Guid discountId, Discount discount)
        {
            var existingDiscount = await _context.Discounts.FindAsync(discountId);
            if (existingDiscount == null)
            {
                return null;
            }

            existingDiscount.Name = discount.Name;
            existingDiscount.OrderId = discount.OrderId;
            existingDiscount.StartDate = discount.StartDate;
            existingDiscount.EndDate = discount.EndDate;

            await _context.SaveChangesAsync();
            return existingDiscount;
        }

        public async Task<bool> DeleteAsync(Guid discountId)
        {
            var discount = await _context.Discounts.FindAsync(discountId);
            if (discount == null)
            {
                return false;
            }

            _context.Discounts.Remove(discount);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsDiscountBelongingToShopAsync(Guid discountId, Guid shopId)
        {
            return await _context.Discounts.AnyAsync(d => d.DiscountId == discountId && d.ShopId == shopId);
        }
    }
}
