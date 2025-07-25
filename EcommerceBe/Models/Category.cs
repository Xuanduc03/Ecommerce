using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Category
    {
        public Guid CategoryId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        // Quan hệ cha-con
        public Guid? ParentCategoryId { get; set; }
        public virtual Category ParentCategory { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();

        // Hình ảnh
        public string? ImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; }

        // SEO
        public string? Slug { get; set; }       
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }

        // Quan hệ sản phẩm
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
