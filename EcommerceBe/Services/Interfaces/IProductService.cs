using EcommerceBe.Dto;
using EcommerceBe.Models;
using System.Threading.Tasks;

namespace EcommerceBe.Services.Interfaces
{
    public interface IProductService
    {

        Task<ProductResponseDto> GetByIdAsync(Guid productId);
        Task<List<ProductResponseDto>> GetByShopIdAsync(Guid shopId);
        Task<List<ProductResponseDto>> GetAllProductsAsync();
        Task<List<ProductResponseDto>> SearchProductsAsync(ProductFilterDto filter);
        Task<PagedResultDto<ProductResponseDto>> QueryProductsAsync(ProductQueryDto queryDto);

        Task CreateProductAsync(CreateProductDto dto);
        Task UpdateProductAsync(Guid productId, CreateProductDto dto);
        Task DeleteProductAsync(Guid productId);

        Task<List<ProductInventoryDto>> GetInventoryBySellerAsync(Guid sellerId);

    }
}
