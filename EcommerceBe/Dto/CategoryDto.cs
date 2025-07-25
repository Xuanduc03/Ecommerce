using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{
    public class CategoryDto
    {
        public Guid CategoryId { get; set; }

        public string Name { get; set; }
        public string? Description { get; set; }

        public Guid? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }

        // SEO
        public string? Slug { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }

        // Ảnh
        public string? ImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; }

        // Danh sách con (chỉ trả khi cần)
        public List<CategoryDto>? SubCategories { get; set; }

        // Tổng số sản phẩm thuộc danh mục (nếu cần)
        public int? ProductCount { get; set; }
    }


    public class CreateCategoryDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public Guid? ParentCategoryId { get; set; }

        // SEO
        public string? Slug { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }

        // Ảnh
        public string? ImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
    }

    public class UpdateCategoryDto
    {
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public Guid? ParentCategoryId { get; set; }

        // SEO
        public string? Slug { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }

        // Ảnh
        public string? ImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
    }

}
