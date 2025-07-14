
namespace EcommerceBe.Models
{
    public class OrderDiscount
    {
        public Guid OrderId { get; set; }
        public Guid DiscountId { get; set; }
        public Order Order { get; set; }
        public Discount Discount { get; set; }
    }
}
