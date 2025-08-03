namespace EcommerceBe.Models
{
    public class DiscountProduct
    {
        public Guid DiscountId { get; set; }
        public Guid ProductId { get; set; }
        public virtual Discount Discount { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}
