using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IShopRepository
    {
        Task<Shop?> GetByIdAsync(Guid shopId);
        Task<Shop?> GetBySellerIdAsync(Guid sellerId);
        Task<List<Shop>> GetAllAsync();
        Task AddAsync(Shop shop);
        Task UpdateAsync(Shop shop);
        Task DeleteAsync(Guid shopId);
    }
}
