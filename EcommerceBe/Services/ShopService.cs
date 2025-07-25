using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class ShopService : IShopService
    {
        private readonly IShopRepository _shopRepository;
        private readonly ISellerRepository _sellerRepository;

        public ShopService(IShopRepository shopRepository, ISellerRepository sellerRepository)
        {
            _shopRepository = shopRepository;
            _sellerRepository = sellerRepository;
        }

        public async Task<CreateShopDto> GetShopByIdAsync(Guid shopId)
        {
            var shop = await _shopRepository.GetByIdAsync(shopId);
            if (shop == null)
                throw new Exception("Shop not found");
            return new CreateShopDto { 
                Name = shop.Name,
                ContactPhone = shop.ContactPhone,
                Description = shop.Description,
                LogoUrl = shop.LogoUrl,
                BannerUrl = shop.BannerUrl
            };
        }

        public async Task<ShopResponseDto> GetShopBySellerIdAsync(Guid sellerId)
        {
            var shop = await _shopRepository.GetBySellerIdAsync(sellerId);
            if (shop == null)
                throw new Exception("Seller has not created a shop yet");
            return new ShopResponseDto
            {
                ShopId = shop.ShopId,
                Name = shop.Name,
                ContactPhone = shop.ContactPhone,
                Description = shop.Description,
                LogoUrl = shop.LogoUrl,
                BannerUrl = shop.BannerUrl
            };
        }

        public async Task<List<ShopResponseDto>> GetAllShopsAsync()
        {
            var shops = await _shopRepository.GetAllAsync();
            return shops.Select(shop => new ShopResponseDto
            {
                ShopId = shop.ShopId,
                SellerId = shop.SellerId,
                Name = shop.Name,
                ContactPhone = shop.ContactPhone,
                Description = shop.Description,
                LogoUrl = shop.LogoUrl,
                BannerUrl = shop.BannerUrl
            }).ToList();
        }

        public async Task CreateShopAsync(CreateShopDto dto, Guid sellerId)
        {
            try
            {
                var seller = await _sellerRepository.GetByIdAsync(sellerId);
                if (seller == null)
                {
                    throw new Exception($"Seller not found for ID {sellerId}");
                }

                // Kiểm tra seller đã có shop chưa
                var existingShop = await _shopRepository.GetBySellerIdAsync(sellerId);
                if (existingShop != null)
                    throw new Exception("Seller already has a shop");

                // Tạo shop mới
                var shop = new Shop
                {
                    ShopId = Guid.NewGuid(),
                    SellerId = sellerId,
                    Name = dto.Name,
                    Description = dto.Description,
                    ContactPhone = dto.ContactPhone,
                    LogoUrl = dto.LogoUrl,
                    BannerUrl = dto.BannerUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _shopRepository.AddAsync(shop);

                // Gán ShopId vào seller để liên kết
                seller.ShopId = shop.ShopId;
                await _sellerRepository.UpdateAsync(seller);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error in CreateShopAsync: {ex.Message}", ex);
            }
            
        }


        public async Task UpdateShopAsync(UpdateShopDto shop)
        {
            var existingShop = await _shopRepository.GetByIdAsync(shop.ShopId);
            if (existingShop == null)
                throw new Exception("Shop not found");

            // Bỏ kiểm tra sellerId
            existingShop.Name = shop.Name;
            existingShop.ContactPhone = shop.ContactPhone;
            existingShop.LogoUrl = shop.LogoUrl;
            existingShop.BannerUrl = shop.BannerUrl;
            existingShop.Description = shop.Description;

            await _shopRepository.UpdateAsync(existingShop);
        }


        public async Task DeleteShopAsync(Guid shopId)
        {
            var shop = await _shopRepository.GetByIdAsync(shopId);
            if (shop == null)
                throw new Exception("Shop not found");

            await _shopRepository.DeleteAsync(shopId);
        }
    }
}