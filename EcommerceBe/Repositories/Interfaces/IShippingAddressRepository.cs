using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IShippingAddressRepository
    {
        Task<List<ShippingAddress>> GetByUserIdAsync(Guid userId);
        Task<ShippingAddress?> GetByIdAsync(Guid id);
        Task AddAsync(ShippingAddress address);
        Task UpdateAsync(ShippingAddress address);
        Task DeleteAsync(ShippingAddress address);
        Task UnsetDefaultAsync(Guid userId);
        Task SaveChangesAsync();
    }
}
