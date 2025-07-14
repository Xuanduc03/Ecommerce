using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IShopRepository _shopRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Product> GetByIdAsync(Guid productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
            throw new Exception("Product not found");
        return product;
    }

    public async Task<List<Product>> GetByShopIdAsync(Guid shopId)
    {
        return await _productRepository.GetByShopIdAsync(shopId);
    }

    public async Task CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            ProductId = Guid.NewGuid(),
            ProductName = dto.ProductName,
            Description = dto.Description,
            Price = dto.Price,
            ShopId = dto.ShopId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            IsDeleted = false,
            ProductImages = dto.ImageUrls.Select(url => new ProductImages
            {
                ProductImageId = Guid.NewGuid(),
                ImageUrl = url,
                IdPrimary = false // có thể cập nhật logic chọn ảnh chính sau
            }).ToList(),
            Variants = dto.Variants.Select(v => new ProductVariant
            {
                ProductVariantId = Guid.NewGuid(),
                Size = v.Size,
                ColorCode = v.ColorCode,
                ColorName = v.ColorName,
                StockQuantity = v.StockQuantity,
                ViewsCount = 0,
                SalesCount = 0,
                BrandNew = v.BrandNew,
                Features = v.Features,
                SeoDescription = v.SeoDescription
            }).ToList(),
            ProductCategories = new List<ProductCategories>
            {
                new ProductCategories
                {
                    ProductId = Guid.Empty, // sẽ gán sau khi có ProductId
                    CategoryId = dto.CategoryId
                },
                new ProductCategories
                {
                    ProductId = Guid.Empty,
                    CategoryId = dto.SubcategoryId
                }
            }
        };

        // fix ProductId vào ProductCategories
        foreach (var pc in product.ProductCategories)
        {
            pc.ProductId = product.ProductId;
        }

        await _productRepository.AddAsync(product);
    }

    //update product
    public async Task UpdateProductAsync(Guid productId, CreateProductDto dto)
    {
        var existing = await _productRepository.GetByIdAsync(productId);
        if (existing == null)
            throw new Exception("Product not found");

        existing.ProductName = dto.ProductName;
        existing.Description = dto.Description;
        existing.Price = dto.Price;
        existing.UpdatedAt = DateTime.UtcNow;

        // Update Images
        existing.ProductImages.Clear();
        foreach (var url in dto.ImageUrls)
        {
            existing.ProductImages.Add(new ProductImages
            {
                ProductImageId = Guid.NewGuid(),
                ImageUrl = url,
                IdPrimary = false,
                ProductId = existing.ProductId
            });
        }

        // Update Variants
        existing.Variants.Clear();
        foreach (var v in dto.Variants)
        {
            existing.Variants.Add(new ProductVariant
            {
                ProductVariantId = Guid.NewGuid(),
                Size = v.Size,
                ColorCode = v.ColorCode,
                ColorName = v.ColorName,
                StockQuantity = v.StockQuantity,
                BrandNew = v.BrandNew,
                ViewsCount = 0,
                SalesCount = 0,
                Features = v.Features,
                SeoDescription = v.SeoDescription,
                ProductId = existing.ProductId // gán nếu cần
            });
        }


        // Update categories
        existing.ProductCategories.Clear();
        existing.ProductCategories.Add(new ProductCategories
        {
            ProductId = existing.ProductId,
            CategoryId = dto.CategoryId
        });
        existing.ProductCategories.Add(new ProductCategories
        {
            ProductId = existing.ProductId,
            CategoryId = dto.SubcategoryId
        });

        await _productRepository.UpdateAsync(existing);
    }

    public async Task DeleteProductAsync(Guid productId)
    {
        await _productRepository.DeleteAsync(productId);
    }

    //filter
    public async Task<List<Product>> SearchProductsAsync(ProductFilterDto filter)
    {
        return await _productRepository.SearchProductsAsync(filter);
    }


    // xem tồn kho
    public async Task<List<ProductInventoryDto>> GetInventoryBySellerAsync(Guid sellerId)
    {
        var shop = await _shopRepository.GetBySellerIdAsync(sellerId);
        if (shop == null)
            throw new Exception("Seller chưa có shop");

        return await _productRepository.GetInventoryByShopIdAsync(shop.ShopId);
    }

    public async Task<PagedResultDto<Product>> QueryProductsAsync(ProductQueryDto queryDto)
    {
        return await _productRepository.QueryProductsAsync(queryDto);
    }

}
