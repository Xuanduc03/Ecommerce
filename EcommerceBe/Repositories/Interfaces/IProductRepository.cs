using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(Guid productId);
        Task<List<Product>> GetByShopIdAsync(Guid shopId);
        Task<List<Product>> GetByIdsAsync(List<Guid> productIds);
        Task UpdateStockAsync(Guid productId, int newStock);
        Task AddAsync(Product product);
        Task UpdateAsync(Guid productId, CreateProductDto dto);
        Task DeleteAsync(Guid productId);
        Task<ProductVariant?> GetProductVariantByIdAsync(Guid productVariantId);
        Task<List<Product>> GetTopProductsByCategoryAsync(Guid categoryId, int count);
        Task UpdateProductVariantAsync(ProductVariant productVariant);
        Task<List<Product>> SearchProductsAsync(string keyword);
        Task<List<ProductInventoryDto>> GetInventoryByShopIdAsync(Guid shopId);
        Task<PagedResultDto<Product>> QueryProductsAsync(ProductQueryDto queryDto);
        Task<List<Product>> GetProductsByCategoryTreeAsync(Guid categoryId);



    }
}
