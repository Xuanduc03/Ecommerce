using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;

namespace EcommerceBe.Services.Interfaces
{
    public interface IShopService
    {
        Task<Shop> GetShopByIdAsync(Guid shopId);
        Task<Shop> GetShopBySellerIdAsync(Guid sellerId);
        Task<List<Shop>> GetAllShopsAsync();
        Task CreateShopAsync(Shop shop, Guid sellerId);
        Task UpdateShopAsync(Shop shop, Guid sellerId);
        Task DeleteShopAsync(Guid shopId, Guid sellerId );
    }
}
