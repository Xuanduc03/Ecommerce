namespace EcommerceBe.Models
{
    public class CartItem
    {
        public Guid CartItemId { get; set; }
        public Guid CartId { get; set; }
        public Guid ProductVariantId { get; set; }    // Hoặc ProductId nếu không dùng variant
        public int Quantity { get; set; }
        public decimal Price { get; set; }            // Giá tại thời điểm thêm vào cart
        public DateTime AddedAt { get; set; }

        public virtual Cart Cart { get; set; }
        public virtual ProductVariant ProductVariant { get; set; }
    }
}
