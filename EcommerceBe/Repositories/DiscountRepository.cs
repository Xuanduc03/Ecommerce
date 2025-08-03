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
                .Include(d => d.DiscountProducts)
                    .ThenInclude(dp => dp.Product)
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
                .Include(d => d.DiscountProducts)
                    .ThenInclude(dp => dp.Product)
                .FirstOrDefaultAsync(d => d.DiscountId == discountId);
        }

        public async Task<Discount> CreateAsync(Discount discount)
        {
            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();
            return discount;
        }

        public async Task<Discount> UpdateAsync(Guid discountId, Discount discount)
        {
            var existingDiscount = await _context.Discounts
                .Include(d => d.DiscountProducts)
                .FirstOrDefaultAsync(d => d.DiscountId == discountId);

            if (existingDiscount == null)
            {
                return null;
            }

            // Cập nhật thông tin cơ bản
            existingDiscount.Name = discount.Name;
            existingDiscount.OrderId = discount.OrderId;
            existingDiscount.ShopId = discount.ShopId;
            existingDiscount.StartDate = discount.StartDate;
            existingDiscount.EndDate = discount.EndDate;
            existingDiscount.DiscountType = discount.DiscountType;
            existingDiscount.DiscountValue = discount.DiscountValue;

            // Xóa tất cả DiscountProducts cũ
            if (existingDiscount.DiscountProducts.Any())
            {
                _context.DiscountProducts.RemoveRange(existingDiscount.DiscountProducts);
            }

            // Thêm DiscountProducts mới
            if (discount.DiscountProducts != null && discount.DiscountProducts.Any())
            {
                foreach (var dp in discount.DiscountProducts)
                {
                    _context.DiscountProducts.Add(new DiscountProduct
                    {
                        DiscountId = discountId,
                        ProductId = dp.ProductId
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Load lại để trả về đầy đủ thông tin
            return await _context.Discounts
                .Include(d => d.DiscountProducts)
                .FirstOrDefaultAsync(d => d.DiscountId == discountId);
        }
        public async Task<bool> DeleteAsync(Guid discountId)
        {
            var discount = await _context.Discounts
                .Include(d => d.DiscountProducts) // Include để xóa các bản ghi liên kết
                .FirstOrDefaultAsync(d => d.DiscountId == discountId);

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
            return await _context.Discounts
                .AnyAsync(d => d.DiscountId == discountId && d.ShopId == shopId);
        }

        public async Task<Discount> GetByCodeAsync(string code)
        {
            return await _context.Discounts
                .Include(d => d.Shop)
                .Include(d => d.Order)
                .Include(d => d.DiscountProducts)
                    .ThenInclude(dp => dp.Product)
                .FirstOrDefaultAsync(d => d.Name == code);
        }
    }
}
