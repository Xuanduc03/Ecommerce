
namespace EcommerceBe.Models
{
    public class Product
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public decimal Price { get; set; }
        public Guid ShopId { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }

        public virtual Shop Shop { get; set; }
        public virtual ICollection<ProductVariant> Variants { get; set; }
        public virtual ICollection<ProductImages> ProductImages { get; set; }
        public virtual ICollection<ProductCategories> ProductCategories { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }
}
