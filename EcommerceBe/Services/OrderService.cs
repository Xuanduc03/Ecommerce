using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;

        public OrderService(IOrderRepository orderRepository, IProductRepository productRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
        }

        public async Task<List<Guid>> CreateOrderAsync(Guid userId, OrderCreateDto dto)
        {
            var orders = new List<Guid>();
            var groupedItems = dto.cartItems.GroupBy(x => x.ShopId);

            foreach (var group in groupedItems)
            {
                var shopId = group.Key;
                var orderItems = new List<OrderItem>();
                decimal totalAmount = 0;
                var now = DateTime.UtcNow;

                foreach (var item in group)
                {
                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product == null)
                        throw new Exception($"Product {item.ProductId} not found");

                    if (product.StockQuantity < item.Quantity)
                        throw new Exception($"Not enough stock for product {product.ProductName}");

                    await _productRepository.UpdateStockAsync(product.ProductId, product.StockQuantity - item.Quantity);

                    orderItems.Add(new OrderItem
                    {
                        OrderItemId = Guid.NewGuid(),
                        ProductId = product.ProductId,
                        Quantity = item.Quantity,
                        Price = product.OriginalPrice
                    });

                    totalAmount += product.OriginalPrice * item.Quantity;
                }

                var order = new Order
                {
                    OrderId = Guid.NewGuid(),
                    UserId = userId,
                    ShopId = shopId,
                    CreatedAt = now,
                    OrderDate = now,
                    PaymentMethod = dto.PaymentMethod,
                    Status = "Pending",
                    TotalAmount = totalAmount,
                    ShippingAddressId = dto.ShippingAddressId,
                    OrderItems = orderItems
                };

                await _orderRepository.AddOrderAsync(order);
                orders.Add(order.OrderId);
            }

            return orders;
        }

        public async Task<List<ReponseOrderAllDto>> GetAllOrderAsync()
        {
            var orders = await _orderRepository.GetAllOrderAsync();
            if (orders == null || !orders.Any())
                throw new Exception("Không có đơn hàng nào");

            return orders.Select(MapToResponseDto).ToList();
        }

        public async Task<OrderDto> GetOrderByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Order not found");

            return new OrderDto
            {
                OrderId = order.OrderId,
                CreatedAt = order.CreatedAt,
                ShippingAddress = FormatAddress(order.ShippingAddress),
                PaymentMethod = order.PaymentMethod,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        public async Task<List<ReponseOrderAllDto>> GetOrdersByShopIdAsync(Guid shopId)
        {
            var orders = await _orderRepository.GetOrdersByShopIdAsync(shopId);
            if (orders == null || !orders.Any())
                throw new Exception("Không có đơn hàng nào");

            return orders.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ReponseOrderAllDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            return orders.Select(MapToResponseDto).ToList();
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Order not found");

            order.Status = status;
            await _orderRepository.UpdateOrderAsync(order);
        }

        public async Task CancelOrderAsync(Guid orderId, string reason)
        {
            await _orderRepository.CancelOrderAsync(orderId, reason);
        }
        public async Task DeleteOrderAsync(Guid orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) throw new Exception("Order not found");

            await _orderRepository.DeleteAsync(order);
            await _orderRepository.SaveChangeAsync();
        }
        public async Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId)
        {
            return await _orderRepository.CheckOrderBelongsToUserAsync(orderId, userId);
        }

        // ========== Helper ==========

        private static ReponseOrderAllDto MapToResponseDto(Order o)
        {
            return new ReponseOrderAllDto
            {
                OrderId = o.OrderId,
                CreatedAt = o.CreatedAt,
                ShippingAddress = FormatAddress(o.ShippingAddress),
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                UserName = o.ShippingAddress?.user?.FullName ?? "",
                Items = o.OrderItems.Select(oi => new ReponseOrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.product?.ProductName ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        public async Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid sellerId)
        {
            var orders = await _orderRepository.GetOrdersBySellerIdAsync(sellerId);
            return orders.Select(MapToSellerOrderDto).ToList();
        }

        public async Task UpdateSellerOrderStatusAsync(Guid orderId, string status, Guid sellerId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new Exception("Order not found");

            // Verify order belongs to seller
            var belongsToSeller = await CheckOrderBelongsToSellerAsync(orderId, sellerId);
            if (!belongsToSeller)
                throw new UnauthorizedAccessException("Order does not belong to this seller");

            await UpdateOrderStatusAsync(orderId, status);
        }

        public async Task<bool> CheckOrderBelongsToSellerAsync(Guid orderId, Guid sellerId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) return false;

            var shop = await _orderRepository.GetShopBySellerIdAsync(sellerId);
            return shop != null && order.ShopId == shop.ShopId;
        }

        private static SellerOrderDto MapToSellerOrderDto(Order o)
        {
            return new SellerOrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                CustomerName = o.ShippingAddress?.FullName ?? "",
                CustomerPhone = o.ShippingAddress?.PhoneNumber ?? "",
                ShippingAddress = FormatAddress(o.ShippingAddress),
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                Items = o.OrderItems.Select(oi => new ReponseOrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.product?.ProductName ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        private static string FormatAddress(ShippingAddress? addr)
        {
            if (addr == null) return "";
            return $"{addr.FullName}, {addr.PhoneNumber}, {addr.Street}, {addr.Ward}, {addr.District}, {addr.City}";
        }
    }
}

