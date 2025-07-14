namespace EcommerceBe.Dto
{
    public class OrderCreateDto
    {
        public Guid ShopId { get; set; }
        public Guid ShippingAddressId { get; set; }
        public string PaymentMethod { get; set; }
        public List<Guid>? DiscountIds { get; set; }
        public List<OrderItemCreateDto> Items { get; set; }
    }

    public class OrderItemCreateDto
    {
        public Guid ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }
    public class OrderDto
    {
        public Guid OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }

        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public Guid ProductVariantId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string VariantDesc { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class OrderSearchFilterDto
    {
        public Guid ShopId { get; set; }
        public string? OrderCode { get; set; }
        public Guid? UserId { get; set; }
        public OrderStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
    public class CancelOrderDto
    {
        public string Reason { get; set; }
    }
    public enum OrderStatus
    {
        Pending,        // Chờ xác nhận
        Confirmed,      // Đã xác nhận
        Shipping,       // Đang giao
        Delivered,      // Đã giao
        Cancelled       // Đã hủy
    }

}
