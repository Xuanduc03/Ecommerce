using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IShopRepository _shopRepository;
    private readonly ICategoryRepository _categoryRepository; // Thêm để validate category

    public ProductService(
        IProductRepository productRepository,
        IShopRepository shopRepository,
        ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _shopRepository = shopRepository;
        _categoryRepository = categoryRepository;
    }


    public async Task<List<ProductResponseDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllAsync();

        if (products == null)
            throw new NotFoundException($"Product with not found");
        return products.Select(MapToResponse).ToList();
    }

    public async Task<ProductResponseDto> GetByIdAsync(Guid productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
            throw new NotFoundException($"Product with ID {productId} not found");
        return MapToResponse(product);
    }

    public async Task<List<ProductResponseDto>> GetByShopIdAsync(Guid shopId)
    {
        var products = await _productRepository.GetByShopIdAsync(shopId);
        return products.Select(MapToResponse).ToList();

    }
    // Tạo sản phẩm
    public async Task CreateProductAsync(CreateProductDto dto)
    {
        // Validation
        await ValidateCreateProductDto(dto);

        var productId = Guid.NewGuid();
        var product = new Product
        {
            ProductId = productId,
            ProductName = dto.ProductName,
            Description = dto.Description,
            OriginalPrice = dto.OriginalPrice,
            ShopId = dto.ShopId != Guid.Empty ? dto.ShopId : (Guid?)null,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            IsDeleted = false,

            ProductImages = dto.ImageUrls.Select((url, index) => new ProductImages
            {
                ProductImageId = Guid.NewGuid(),
                ProductId = productId,
                ImageUrl = url,
                IsPrimary = index == 0
            }).ToList(),

            // Tạo ProductVariants
            Variants = dto.Variants.Select(v => new ProductVariant
            {
                ProductVariantId = Guid.NewGuid(),
                ProductId = productId,
                Size = v.Size,
                ColorCode = v.ColorCode,
                ColorName = v.ColorName,
                StockQuantity = v.StockQuantity,
                Price = v.Price,
                ViewsCount = 0,
                SalesCount = 0,
                BrandNew = v.BrandNew,
                Features = v.Features,
                SeoDescription = v.SeoDescription
            }).ToList(),

            // Tạo ProductCategories
            ProductCategories = new List<ProductCategories>
                {
                    new ProductCategories
                    {
                        ProductId = productId,
                        CategoryId = dto.CategoryId
                    },
                    new ProductCategories
                    {
                        ProductId = productId,
                        CategoryId = dto.SubcategoryId
                    }
                }
        };

        await _productRepository.AddAsync(product);
    }

    // Chỉnh sửa sản phẩm
    public async Task UpdateProductAsync(Guid productId, CreateProductDto dto)
    {
        await ValidateUpdateProductDto(dto);
        await _productRepository.UpdateAsync(productId, dto);
    }

    // xóa sản phẩm
    public async Task DeleteProductAsync(Guid productId)
    {
        var existing = await _productRepository.GetByIdAsync(productId);
        if (existing == null)
            throw new NotFoundException($"Product with ID {productId} not found");

        // Soft delete thay vì hard delete
        existing.IsDeleted = true;
        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;

        await _productRepository.DeleteAsync(productId);
    }

    public async Task<List<ProductResponseDto>> SearchProductsAsync(string keyword)
    {
        var products = await _productRepository.SearchProductsAsync(keyword);
        return products.Select(MapToResponse).ToList();
    }

    public async Task<List<ProductResponseDto>> GetProductsByCategoryAsync(Guid categoryId)
    {
        var products = await _productRepository.GetProductsByCategoryTreeAsync(categoryId);
        return products.Select(MapToResponse).ToList();
    }


    public async Task<List<ProductInventoryDto>> GetInventoryBySellerAsync(Guid sellerId)
    {
        var shop = await _shopRepository.GetBySellerIdAsync(sellerId);
        if (shop == null)
            throw new NotFoundException("Seller does not have a shop");

        return await _productRepository.GetInventoryByShopIdAsync(shop.ShopId);
    }
    public async Task<List<ProductResponseDto>> GetTopProductsByCategoryAsync(Guid categoryId, int count = 10)
    {
        var products = await _productRepository.GetTopProductsByCategoryAsync(categoryId, count);
        return products.Select(MapToResponse).ToList();
    }

    public async Task<PagedResultDto<ProductResponseDto>> QueryProductsAsync(ProductQueryDto queryDto)
    {
        var pagedProducts = await _productRepository.QueryProductsAsync(queryDto);
        return new PagedResultDto<ProductResponseDto>
        {
            TotalCount = pagedProducts.TotalCount,
            Items = pagedProducts.Items.Select(MapToResponse).ToList()
        };
    }


    private async Task ValidateCreateProductDto(CreateProductDto dto)
    {
        // bắt buộc có ShopId & ảnh
        if (!dto.ShopId.HasValue) throw new ArgumentException("ShopId is required");
        await EnsureShopExists(dto.ShopId.Value);

        await EnsureCategoryExists(dto.CategoryId, dto.SubcategoryId);

        if (dto.OriginalPrice <= 0) throw new ArgumentException("Price must be greater than 0");
        if (dto.Variants == null || !dto.Variants.Any())
            throw new ArgumentException("Product must have at least one variant");
        if (dto.ImageUrls == null || !dto.ImageUrls.Any())
            throw new ArgumentException("Product must have at least one image");
    }

    private async Task ValidateUpdateProductDto(CreateProductDto dto)
    {
        await EnsureCategoryExists(dto.CategoryId, dto.SubcategoryId);

        if (dto.OriginalPrice <= 0) throw new ArgumentException("Price must be greater than 0");
        if (dto.Variants == null || !dto.Variants.Any())
            throw new ArgumentException("Product must have at least one variant");
    }
    private async Task EnsureCategoryExists(Guid catId, Guid subId)
    {
        if (await _categoryRepository.GetByIdAsync(catId) == null)
            throw new NotFoundException($"Category {catId} not found");
        if (await _categoryRepository.GetByIdAsync(subId) == null)
            throw new NotFoundException($"Sub‑category {subId} not found");
    }
    private async Task EnsureShopExists(Guid shopId)
    {
        var shop = await _shopRepository.GetByIdAsync(shopId);
        if (shop == null) throw new NotFoundException($"Shop with ID {shopId} not found");
    }


    private ProductResponseDto MapToResponse(Product p)
    {
        var categories = p.ProductCategories.ToList();
        var category = categories.FirstOrDefault(); // cha
        var subcategory = categories.Skip(1).FirstOrDefault(); // con

        int totalStock = p.Variants.Sum(v => v.StockQuantity);

        return new ProductResponseDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            Description = p.Description,
            OriginalPrice = p.OriginalPrice,
            ShopId = p.ShopId ?? Guid.Empty,
            FinalPrice = p.OriginalPrice, 
            DiscountPercent = 0,
            CategoryId = category?.CategoryId ?? Guid.Empty,
            CategoryName = category?.Category?.Name ?? string.Empty,
            SubcategoryId = subcategory?.CategoryId ?? Guid.Empty,
            SubcategoryName = subcategory?.Category?.Name ?? string.Empty,
            StockQuantity = totalStock,
            ImageUrls = p.ProductImages.Select(img => img.ImageUrl).ToList(),
            Variants = p.Variants.Select(v => new ProductVariantResponseDto
            {
                VariantId = v.ProductVariantId,
                Size = v.Size,
                ColorCode = v.ColorCode,
                ColorName = v.ColorName,
                StockQuantity = v.StockQuantity,
                Price = v.Price,
                BrandNew = v.BrandNew,
                Features = v.Features,
                SeoDescription = v.SeoDescription
            }).ToList()
        };
    }


}

// ✅ Custom Exceptions
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}