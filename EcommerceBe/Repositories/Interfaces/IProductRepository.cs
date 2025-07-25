using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(Guid productId);
        Task<List<Product>> GetByShopIdAsync(Guid shopId);
        Task AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Guid productId);
        Task<ProductVariant?> GetProductVariantByIdAsync(Guid productVariantId);
        Task UpdateProductVariantAsync(ProductVariant productVariant);
        Task<List<Product>> SearchProductsAsync(ProductFilterDto filter);
        Task<List<ProductInventoryDto>> GetInventoryByShopIdAsync(Guid shopId);
        Task<PagedResultDto<Product>> QueryProductsAsync(ProductQueryDto queryDto);

    }
}
