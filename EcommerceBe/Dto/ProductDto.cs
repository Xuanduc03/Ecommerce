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

    public class CreateProductVariantDto
    {
        [Required]
        [StringLength(50)]
        public string Size { get; set; }

        [Required]
        [StringLength(20)]
        public string ColorCode { get; set; }

        [Required]
        [StringLength(50)]
        public string ColorName { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        public bool BrandNew { get; set; } = true;

        [StringLength(500)]
        public string Features { get; set; }

        [StringLength(300)]
        public string SeoDescription { get; set; }
    }


    public class CreateProductDto
    {
        [Required] public string ProductName { get; set; }
        public string Description { get; set; }
        [Required] public decimal OriginalPrice { get; set; } // Giá gốc (hiển thị)
        public Guid CategoryId { get; set; }
         public Guid SubcategoryId { get; set; }
        public Guid? ShopId { get; set; }
        public List<string> ImageUrls { get; set; }
        public List<CreateProductVariantDto> Variants { get; set; }  // Thay kiểu
    }


    public class UpdateProductDto : CreateProductDto
    {
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
        public string? SortBy { get; set; }
        public bool Descending { get; set; } = false;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }


    // dto get all 
    public class ProductResponseDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal FinalPrice { get; set; } = 0;
        public double DiscountPercent { get; set; } = 0;
        public int StockQuantity { get; set; }
        public Guid ShopId { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string SubcategoryName { get; set; }
        public Guid SubcategoryId { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public List<ProductVariantResponseDto> Variants { get; set; } = new();
    }

    public class ProductVariantResponseDto
    {
        public Guid VariantId { get; set; }
        public string Size { get; set; }
        public string ColorCode { get; set; }
        public string ColorName { get; set; }
        public int StockQuantity { get; set; }
        public decimal Price { get; set; }
        public bool BrandNew { get; set; }
        public string Features { get; set; }
        public string SeoDescription { get; set; }
    }


}
