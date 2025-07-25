using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IDiscountRepository
    {
        Task<List<Discount>> GetAllAsync(Guid? shopId = null);
        Task<Discount> GetByIdAsync(Guid discountId);
        Task<Discount> CreateAsync(Discount discount);
        Task<Discount> UpdateAsync(Guid discountId, Discount discount);
        Task<bool> DeleteAsync(Guid discountId);
        Task<bool> IsDiscountBelongingToShopAsync(Guid discountId, Guid shopId);
    }

}
