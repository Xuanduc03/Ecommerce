using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{
    public class ProductVariantDto
    {
        public string Size { get; set; }
        public string ColorCode { get; set; }
        public string ColorName { get; set; }
        public int StockQuantity { get; set; }
        public bool BrandNew { get; set; }
        public string Features { get; set; }
        public string SeoDescription { get; set; }
    }


    public class CreateProductDto
    {
        [Required] public string ProductName { get; set; }
        public string Description { get; set; }
        [Required] public decimal OriginalPrice { get; set; }
        [Required] public decimal Price { get; set; }
        [Required] public Guid CategoryId { get; set; }
        [Required] public Guid SubcategoryId { get; set; }
        public Guid ShopId { get; set; }
        public List<string> ImageUrls { get; set; } // danh sách url ảnh
        public List<ProductVariantDto> Variants { get; set; }
    }

    // filter dto
    public class ProductFilterDto
    {
        public string? Keyword { get; set; }               // từ khóa tìm kiếm
        public Guid? CategoryId { get; set; }              // ID danh mục cha
        public Guid? SubCategoryId { get; set; }           // ID danh mục con
        public string? Size { get; set; }                  // lọc theo size
        public string? ColorCode { get; set; }             // lọc theo mã màu
        public decimal? MinPrice { get; set; }             // lọc theo giá từ
        public decimal? MaxPrice { get; set; }             // lọc theo giá đến
    }

    // inventory dto
    public class ProductInventoryDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public List<ProductVariantStockDto> Variants { get; set; }
    }

    public class ProductVariantStockDto
    {
        public Guid VariantId { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public int StockQuantity { get; set; }
        public int SalesCount { get; set; }
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
    }

    public class ProductQueryDto
    {
        public Guid? ShopId { get; set; }
        public string? SearchTerm { get; set; }
        public List<Guid>? CategoryIds { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; } // "price", "name", "createdAt", ...
        public bool Descending { get; set; } = false;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }


}
