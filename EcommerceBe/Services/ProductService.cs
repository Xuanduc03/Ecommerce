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

    public async Task UpdateProductAsync(Guid productId, CreateProductDto dto)
    {
        var existing = await _productRepository.GetByIdAsync(productId);
        if (existing == null)
            throw new NotFoundException($"Product with ID {productId} not found");

        // Validation
        await ValidateCreateProductDto(dto);

        // Update basic properties
        existing.ProductName = dto.ProductName;
        existing.Description = dto.Description;
        existing.OriginalPrice = dto.OriginalPrice;
        existing.UpdatedAt = DateTime.UtcNow;

        // Update Images
        await UpdateProductImages(existing, dto.ImageUrls);

        // Update Variants
        await UpdateProductVariants(existing, dto.Variants);

        // Update categories
        await UpdateProductCategories(existing, dto.CategoryId, dto.SubcategoryId);

        await _productRepository.UpdateAsync(existing);
    }

    public async Task DeleteProductAsync(Guid productId)
    {
        var existing = await _productRepository.GetByIdAsync(productId);
        if (existing == null)
            throw new NotFoundException($"Product with ID {productId} not found");

        // Soft delete thay vì hard delete
        existing.IsDeleted = true;
        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(existing);
    }

    public async Task<List<ProductResponseDto>> SearchProductsAsync(ProductFilterDto filter)
    {
        var products = await _productRepository.SearchProductsAsync(filter);
        return products.Select(MapToResponse).ToList();
    }


    public async Task<List<ProductInventoryDto>> GetInventoryBySellerAsync(Guid sellerId)
    {
        var shop = await _shopRepository.GetBySellerIdAsync(sellerId);
        if (shop == null)
            throw new NotFoundException("Seller does not have a shop");

        return await _productRepository.GetInventoryByShopIdAsync(shop.ShopId);
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
        // Validate Shop exists
        if (!dto.ShopId.HasValue)
        {
            throw new ArgumentException("ShopId is required");
        }

        var shop = await _shopRepository.GetByIdAsync(dto.ShopId.Value);


        // Validate Categories exist
        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
        if (category == null)
            throw new NotFoundException($"Category with ID {dto.CategoryId} not found");

        var subcategory = await _categoryRepository.GetByIdAsync(dto.SubcategoryId);
        if (subcategory == null)
            throw new NotFoundException($"Subcategory with ID {dto.SubcategoryId} not found");

        // Validate business rules
        if (dto.OriginalPrice <= 0)
            throw new ArgumentException("Price must be greater than 0");

        if (dto.Variants == null || !dto.Variants.Any())
            throw new ArgumentException("Product must have at least one variant");

        if (dto.ImageUrls == null || !dto.ImageUrls.Any())
            throw new ArgumentException("Product must have at least one image");
    }

    private async Task UpdateProductImages(Product product, List<string> newImageUrls)
    {
        // Remove old images
        product.ProductImages.Clear();

        // Add new images
        for (int i = 0; i < newImageUrls.Count; i++)
        {
            product.ProductImages.Add(new ProductImages
            {
                ProductImageId = Guid.NewGuid(),
                ProductId = product.ProductId,
                ImageUrl = newImageUrls[i],
                IsPrimary = i == 0 // First image is primary
            });
        }
    }

    private async Task UpdateProductVariants(Product product, List<CreateProductVariantDto> newVariants)
    {
        // Keep track of existing variants to preserve ViewsCount and SalesCount
        var existingVariantLookup = product.Variants.ToDictionary(
            v => $"{v.Size}-{v.ColorCode}",
            v => v
        );

        product.Variants.Clear();

        foreach (var newVariant in newVariants)
        {
            var key = $"{newVariant.Size}-{newVariant.ColorCode}";
            var existingVariant = existingVariantLookup.GetValueOrDefault(key);

            product.Variants.Add(new ProductVariant
            {
                ProductVariantId = existingVariant?.ProductVariantId ?? Guid.NewGuid(),
                ProductId = product.ProductId,
                Size = newVariant.Size,
                ColorCode = newVariant.ColorCode,
                ColorName = newVariant.ColorName,
                StockQuantity = newVariant.StockQuantity,
                Price = newVariant.Price,
                BrandNew = newVariant.BrandNew,
                Features = newVariant.Features,
                SeoDescription = newVariant.SeoDescription,
                // ✅ Preserve existing data
                ViewsCount = existingVariant?.ViewsCount ?? 0,
                SalesCount = existingVariant?.SalesCount ?? 0
            });
        }
    }

    private async Task UpdateProductCategories(Product product, Guid categoryId, Guid subcategoryId)
    {
        product.ProductCategories.Clear();

        product.ProductCategories.Add(new ProductCategories
        {
            ProductId = product.ProductId,
            CategoryId = categoryId
        });

        product.ProductCategories.Add(new ProductCategories
        {
            ProductId = product.ProductId,
            CategoryId = subcategoryId
        });
    }

    private ProductResponseDto MapToResponse(Product p)
    {
        var categories = p.ProductCategories.ToList();
        var category = categories.FirstOrDefault(); // cha
        var subcategory = categories.Skip(1).FirstOrDefault(); // con

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
            ImageUrls = p.ProductImages.Select(img => img.ImageUrl).ToList(),
            Variants = p.Variants.Select(v => new ProductVariantResponseDto
            {
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