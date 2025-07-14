using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class ShopService : IShopService
    {
        private readonly IShopRepository _shopRepository;

        public ShopService(IShopRepository shopRepository)
        {
            _shopRepository = shopRepository;
        }

        public async Task<Shop> GetShopByIdAsync(Guid shopId)
        {
            var shop = await _shopRepository.GetByIdAsync(shopId);
            if (shop == null)
                throw new Exception("Shop not found");
            return shop;
        }

        public async Task<Shop> GetShopBySellerIdAsync(Guid sellerId)
        {
            var shop = await _shopRepository.GetBySellerIdAsync(sellerId);
            if (shop == null)
                throw new Exception("Seller has not created a shop yet");
            return shop;
        }

        public async Task<List<Shop>> GetAllShopsAsync()
        {
            return await _shopRepository.GetAllAsync();
        }

        public async Task CreateShopAsync(Shop shop, Guid sellerId)
        {
            var existingShop = await _shopRepository.GetBySellerIdAsync(sellerId);
            if (existingShop != null)
                throw new Exception("Seller already has a shop");

            shop.SellerId = sellerId;
            shop.ShopId = Guid.NewGuid();
            shop.CreatedAt = DateTime.UtcNow;
            await _shopRepository.AddAsync(shop);
        }

        public async Task UpdateShopAsync(Shop shop, Guid sellerId)
        {
            var existingShop = await _shopRepository.GetByIdAsync(shop.ShopId);
            if (existingShop == null)
                throw new Exception("Shop not found");

            if (existingShop.SellerId != sellerId)
                throw new UnauthorizedAccessException("You do not own this shop");

            // Cập nhật thông tin được phép
            existingShop.Name = shop.Name;
            existingShop.Description = shop.Description;

            await _shopRepository.UpdateAsync(existingShop);
        }

        public async Task DeleteShopAsync(Guid shopId, Guid sellerId)
        {
            var shop = await _shopRepository.GetByIdAsync(shopId);
            if (shop == null)
                throw new Exception("Shop not found");

            if (shop.SellerId != sellerId)
                throw new UnauthorizedAccessException("You do not own this shop");

            await _shopRepository.DeleteAsync(shopId);
        }
    }
}