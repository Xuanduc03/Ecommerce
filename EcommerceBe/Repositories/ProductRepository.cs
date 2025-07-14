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
        public async Task<Product?> GetByIdAsync(Guid productId)
        {
            return await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        public async Task<List<Product>> GetByShopIdAsync(Guid shopId)
        {
            return await _context.Products
                .Where(p => p.ShopId == shopId)
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
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

        //filter 
        public async Task<List<Product>> SearchProductsAsync(ProductFilterDto filter)
        {
            var query = _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Variants)
                .Include(p => p.ProductCategories)
                .Where(p => p.IsActive && !p.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                query = query.Where(p => p.ProductName.Contains(filter.Keyword));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p =>
                    p.ProductCategories.Any(pc => pc.CategoryId == filter.CategoryId));
            }

            if (filter.SubCategoryId.HasValue)
            {
                query = query.Where(p =>
                    p.ProductCategories.Any(pc => pc.CategoryId == filter.SubCategoryId));
            }

            if (!string.IsNullOrWhiteSpace(filter.Size))
            {
                query = query.Where(p =>
                    p.Variants.Any(v => v.Size == filter.Size));
            }

            if (!string.IsNullOrWhiteSpace(filter.ColorCode))
            {
                query = query.Where(p =>
                    p.Variants.Any(v => v.ColorCode == filter.ColorCode));
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice);
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
                query = query.Where(x => x.Price >= queryDto.MinPrice.Value);

            if (queryDto.MaxPrice.HasValue)
                query = query.Where(x => x.Price <= queryDto.MaxPrice.Value);

            // Sorting
            if (!string.IsNullOrEmpty(queryDto.SortBy))
            {
                switch (queryDto.SortBy.ToLower())
                {
                    case "price":
                        query = queryDto.Descending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price);
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
