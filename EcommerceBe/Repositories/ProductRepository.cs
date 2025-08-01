using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;
        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .Include(p => p.ProductCategories)
                    .ThenInclude(pc => pc.Category)
                .Where(p => !p.IsDeleted) // loại bỏ sản phẩm đã xóa mềm
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(Guid productId)
        {
            return await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                 .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
                .FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        public async Task<List<Product>> GetByShopIdAsync(Guid shopId)
        {
            return await _context.Products
                .Where(p => p.ShopId == shopId)
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                 .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
                .ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid productId, CreateProductDto dto)
        {
            var existing = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .Include(p => p.ProductCategories)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (existing == null)
                throw new NotFoundException($"Product with ID {productId} not found");

            // Update scalar fields
            existing.ProductName = dto.ProductName;
            existing.Description = dto.Description;
            existing.OriginalPrice = dto.OriginalPrice;
            existing.ShopId = dto.ShopId;
            existing.UpdatedAt = DateTime.UtcNow;

            // ========================== Variants ==========================
            var incomingVariantKeys = dto.Variants
                .Select(v => $"{v.Size}-{v.ColorCode}")
                .ToHashSet();

            var variantsToRemove = existing.Variants
                .Where(v => !incomingVariantKeys.Contains($"{v.Size}-{v.ColorCode}"))
                .ToList();

            foreach (var v in variantsToRemove)
                _context.ProductVariants.Remove(v);

            foreach (var variant in dto.Variants)
            {
                var key = $"{variant.Size}-{variant.ColorCode}";
                var existingVariant = existing.Variants
                    .FirstOrDefault(v => key == $"{v.Size}-{v.ColorCode}");

                if (existingVariant != null)
                {
                    existingVariant.StockQuantity = variant.StockQuantity;
                    existingVariant.Price = variant.Price;
                    existingVariant.BrandNew = variant.BrandNew;
                    existingVariant.Features = variant.Features;
                    existingVariant.SeoDescription = variant.SeoDescription;
                }
                else
                {
                    _context.ProductVariants.Add(new ProductVariant
                    {
                        ProductVariantId = Guid.NewGuid(),
                        ProductId = existing.ProductId,
                        Size = variant.Size,
                        ColorCode = variant.ColorCode,
                        ColorName = variant.ColorName,
                        StockQuantity = variant.StockQuantity,
                        Price = variant.Price,
                        BrandNew = variant.BrandNew,
                        Features = variant.Features,
                        SeoDescription = variant.SeoDescription,
                        ViewsCount = 0,
                        SalesCount = 0
                    });
                }
            }

            // ========================== ProductImages ==========================
            var incomingImageUrls = dto.ImageUrls?.Select(i => i.Trim()).ToHashSet() ?? new HashSet<string>();

            var imagesToRemove = existing.ProductImages
                .Where(i => !incomingImageUrls.Contains(i.ImageUrl.Trim()))
                .ToList();

            foreach (var img in imagesToRemove)
                _context.ProductImages.Remove(img);

            if (dto.ImageUrls != null && dto.ImageUrls.Any())
            {
                for (int i = 0; i < dto.ImageUrls.Count; i++)
                {
                    var url = dto.ImageUrls[i].Trim();
                    var existingImg = existing.ProductImages.FirstOrDefault(i => i.ImageUrl.Trim() == url);
                    if (existingImg != null)
                    {
                        existingImg.IsPrimary = i == 0; // Hình đầu tiên là primary
                    }
                    else
                    {
                        _context.ProductImages.Add(new ProductImages
                        {
                            ProductImageId = Guid.NewGuid(),
                            ProductId = existing.ProductId,
                            ImageUrl = url,
                            IsPrimary = i == 0
                        });
                    }
                }
            }

            // ========================== ProductCategories ==========================
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

            await _context.SaveChangesAsync();
        }

        public async Task<List<Product>> GetTopProductsByCategoryAsync(Guid categoryId, int count)
        {
            return await _context.Products
                .Where(p => !p.IsDeleted && p.ProductCategories.Any(pc => pc.CategoryId == categoryId))
                .OrderByDescending(p => p.Variants.Sum(v => v.SalesCount))
                .Include(p => p.ProductCategories).ThenInclude(pc => pc.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .ToListAsync();
        }

        public async Task DeleteAsync(Guid productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        // Lấy sản phẩm theo danh mục 
        public async Task<List<Product>> GetProductsByCategoryTreeAsync(Guid categoryId)
        {
            // Bước 1: Lấy toàn bộ danh mục
            var allCategories = await _context.Categories.ToListAsync();

            // Bước 2: Tìm đệ quy tất cả danh mục con của categoryId
            List<Guid> GetAllChildCategoryIds(Guid parentId)
            {
                var children = allCategories
                    .Where(c => c.ParentCategoryId == parentId)
                    .Select(c => c.CategoryId)
                    .ToList();

                var all = new List<Guid>(children);
                foreach (var childId in children)
                {
                    all.AddRange(GetAllChildCategoryIds(childId));
                }
                return all;
            }

            var allCategoryIds = new List<Guid> { categoryId };
            allCategoryIds.AddRange(GetAllChildCategoryIds(categoryId));

            // Bước 3: Lấy sản phẩm thuộc tất cả categoryId
            var products = await _context.Products
                .Where(p => !p.IsDeleted && p.ProductCategories.Any(pc => allCategoryIds.Contains(pc.CategoryId)))
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .Include(p => p.ProductCategories)
                    .ThenInclude(pc => pc.Category)
                .ToListAsync();

            return products;
        }



        public async Task UpdateStockAsync(Guid productId, int newStock)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) throw new Exception("Product not found");

            product.StockQuantity = newStock;
            await _context.SaveChangesAsync();
        }

        //filter 
        public async Task<List<Product>> SearchProductsAsync(string keyword)
        {
            var query = _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .Include(p => p.ProductCategories)
                .Where(p => p.IsActive && !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(p => p.ProductName.Contains(keyword));
            }

            return await query.ToListAsync();
        }


        // quan ly ton kho 
        public async Task<List<ProductInventoryDto>> GetInventoryByShopIdAsync(Guid shopId)
        {
            return await _context.Products
                .Where(p => p.ShopId == shopId && !p.IsDeleted)
                .Select(p => new ProductInventoryDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    Variants = p.Variants.Select(v => new ProductVariantStockDto
                    {
                        VariantId = v.ProductVariantId,
                        Size = v.Size,
                        Color = v.ColorName,
                        StockQuantity = v.StockQuantity,
                        SalesCount = v.SalesCount
                    }).ToList()
                }).ToListAsync();
        }


        public async Task<PagedResultDto<Product>> QueryProductsAsync(ProductQueryDto queryDto)
        {
            var query = _context.Products
                .Include(x => x.ProductImages)
                .Include(x => x.Variants)
                .Include(x => x.ProductCategories)
                .AsQueryable();

            if (queryDto.ShopId.HasValue)
                query = query.Where(x => x.ShopId == queryDto.ShopId.Value);

            if (!string.IsNullOrWhiteSpace(queryDto.SearchTerm))
                query = query.Where(x => x.ProductName.Contains(queryDto.SearchTerm) || x.Description.Contains(queryDto.SearchTerm));

            if (queryDto.CategoryIds != null && queryDto.CategoryIds.Any())
                query = query.Where(x => x.ProductCategories.Any(pc => queryDto.CategoryIds.Contains(pc.CategoryId)));

            if (queryDto.MinPrice.HasValue)
                query = query.Where(x => x.OriginalPrice >= queryDto.MinPrice.Value);

            if (queryDto.MaxPrice.HasValue)
                query = query.Where(x => x.OriginalPrice <= queryDto.MaxPrice.Value);

            // Sorting
            if (!string.IsNullOrEmpty(queryDto.SortBy))
            {
                switch (queryDto.SortBy.ToLower())
                {
                    case "price":
                        query = queryDto.Descending ? query.OrderByDescending(x => x.OriginalPrice) : query.OrderBy(x => x.OriginalPrice);
                        break;
                    case "createdat":
                        query = queryDto.Descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt);
                        break;
                    case "name":
                        query = queryDto.Descending ? query.OrderByDescending(x => x.ProductName) : query.OrderBy(x => x.ProductName);
                        break;
                    default:
                        query = query.OrderByDescending(x => x.CreatedAt);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(x => x.CreatedAt);
            }

            var total = await query.CountAsync();
            var items = await query
                .Skip((queryDto.Page - 1) * queryDto.PageSize)
                .Take(queryDto.PageSize)
                .ToListAsync();

            return new PagedResultDto<Product>
            {
                Items = items,
                TotalCount = total
            };
        }

        public async Task<ProductVariant?> GetProductVariantByIdAsync(Guid productVariantId)
        {
            return await _context.ProductVariants
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.ProductVariantId == productVariantId);
        }

        public async Task UpdateProductVariantAsync(ProductVariant productVariant)
        {
            _context.ProductVariants.Update(productVariant);
            await _context.SaveChangesAsync();
        }

    }
}
