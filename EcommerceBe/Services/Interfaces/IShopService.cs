using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;

namespace EcommerceBe.Services.Interfaces
{
    public interface IShopService
    {
        Task<CreateShopDto> GetShopByIdAsync(Guid shopId);
        Task<ShopResponseDto> GetShopBySellerIdAsync(Guid sellerId);
        Task<List<ShopResponseDto>> GetAllShopsAsync();
        Task CreateShopAsync(CreateShopDto shop, Guid sellerId);
        Task UpdateShopAsync(UpdateShopDto shop);
        Task DeleteShopAsync(Guid shopId);
    }
}
