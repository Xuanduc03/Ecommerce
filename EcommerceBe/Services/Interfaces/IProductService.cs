using EcommerceBe.Dto;
using EcommerceBe.Models;
using System.Threading.Tasks;

namespace EcommerceBe.Services.Interfaces
{
    public interface IProductService
    {
        Task<Product> GetByIdAsync(Guid productId);
        Task<List<Product>> GetByShopIdAsync(Guid shopId);
        Task CreateProductAsync(CreateProductDto dto);
        Task UpdateProductAsync(Guid productId, CreateProductDto dto);
        Task DeleteProductAsync(Guid productId);
        Task<List<Product>> SearchProductsAsync(ProductFilterDto filter);
        // IProductService.cs
        Task<List<ProductInventoryDto>> GetInventoryBySellerAsync(Guid sellerId);
        Task<PagedResultDto<Product>> QueryProductsAsync(ProductQueryDto queryDto);

    }
}
