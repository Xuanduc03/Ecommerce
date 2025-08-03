namespace EcommerceBe.Dto
{
    public class OrderCreateDto
    {
        public Guid ShippingAddressId { get; set; }
        public string PaymentMethod { get; set; }
        public List<Guid>? DiscountIds { get; set; }
        public List<OrderItemCreateDto> cartItems { get; set; }
    }

    public class OrderItemCreateDto
    {
        public Guid ShopId { get; set; }
        public Guid ProductId { get; set; }
        public string? ShippingMethod { get; set; }
        public int Quantity { get; set; }
    }
    public class OrderDto
    {
        public Guid OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; }
        public string ShippingMethod { get; set; }
        public string? TrackingNumber { get; set; } // Mã vận đơn
        public DateTime? EstimatedDeliveryDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? ShippingFee { get; set; }

        public List<OrderItemDto> Items { get; set; }
    }

     public class ReponseOrderAllDto
    {
        public Guid OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; }
        public string ShippingMethod { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? ShippingFee { get; set; }
        public string UserName { get; set; }
        public List<ReponseOrderItemDto> Items { get; set; } = new();
    }

    public class ReponseOrderItemDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
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

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class OrderStatusStatsDto
    {
        public int PendingCount { get; set; }
        public int ConfirmedCount { get; set; }
        public int ShippingCount { get; set; }
        public int DeliveredCount { get; set; }
        public int CancelledCount { get; set; }
    }

    public class TopSellingProductDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class LowStockProductDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class TopCustomerDto
    {
        public Guid UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class SellerDashboardDto
    {
        // Revenue Stats
        public decimal CurrentMonthRevenue { get; set; }
        public decimal LastMonthRevenue { get; set; }
        public decimal RevenueGrowthPercent { get; set; }

        // Order Stats
        public int CurrentMonthOrders { get; set; }
        public int LastMonthOrders { get; set; }
        public decimal OrderGrowthPercent { get; set; }

        // Product Stats
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }

        // Customer Stats
        public int TotalCustomers { get; set; }

        // Order Status Stats
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
    }


    public class SellerOrderDto
    {
        public Guid OrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public List<ReponseOrderItemDto> Items { get; set; } = new();
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; }
    }
    public class RecentOrderDto
    {
        public Guid OrderId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
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
