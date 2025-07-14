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

        public async Task<Guid> CreateOrderAsync(Guid userId, OrderCreateDto dto)
        {
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();
            foreach (var item in dto.Items)
            {
                var variant = await _productRepository.GetProductVariantByIdAsync(item.ProductVariantId);
                if (variant == null)
                    throw new Exception("Product variant not found");
                if (variant.StockQuantity < item.Quantity)
                    throw new Exception("Not enough stock for one product");

                // Trừ tồn kho
                variant.StockQuantity -= item.Quantity;
                await _productRepository.UpdateProductVariantAsync(variant);

                orderItems.Add(new OrderItem
                {
                    OrderItemId = Guid.NewGuid(),
                    ProductVariantId = item.ProductVariantId,
                    ProductId = variant.ProductId,
                    Quantity = item.Quantity,
                    Price = variant.Price
                });
                totalAmount += variant.Price * item.Quantity;
            }

            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId,
                ShopId = dto.ShopId,
                ShippingAddressId = dto.ShippingAddressId,
                CreatedAt = DateTime.UtcNow,
                OrderDate = DateTime.UtcNow,
                PaymentMethod = dto.PaymentMethod,
                Status = "Pending",
                TotalAmount = totalAmount,
                OrderItems = orderItems
            };
            await _orderRepository.AddOrderAsync(order);
            return order.OrderId;
        }

        public async Task<OrderDto> GetOrderByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) throw new Exception("Order not found");

            return new OrderDto
            {
                OrderId = order.OrderId,
                CreatedAt = order.CreatedAt,
                ShippingAddress = order.ShippingAddress != null
                    ? $"{order.ShippingAddress.FullName}, {order.ShippingAddress.PhoneNumber}, {order.ShippingAddress.Street}, {order.ShippingAddress.Ward}, {order.ShippingAddress.District}, {order.ShippingAddress.City}"
                    : "",
                PaymentMethod = order.PaymentMethod,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductVariantId = oi.ProductVariantId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductVariant.Product.ProductName,
                    VariantDesc = $"{oi.ProductVariant.ColorName} {oi.ProductVariant.Size}",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            return orders.Select(order => new OrderDto
            {
                OrderId = order.OrderId,
                CreatedAt = order.CreatedAt,
                ShippingAddress = order.ShippingAddress != null
                    ? $"{order.ShippingAddress.FullName}, {order.ShippingAddress.PhoneNumber}, {order.ShippingAddress.Street}, {order.ShippingAddress.Ward}, {order.ShippingAddress.District}, {order.ShippingAddress.City}"
                    : "",
                PaymentMethod = order.PaymentMethod,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductVariantId = oi.ProductVariantId,
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductVariant.Product.ProductName,
                    VariantDesc = $"{oi.ProductVariant.ColorName} {oi.ProductVariant.Size}",
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) throw new Exception("Order not found");
            order.Status = status;
            await _orderRepository.UpdateOrderAsync(order);
        }

        public async Task CancelOrderAsync(Guid orderId, string reason)
        {
            await _orderRepository.CancelOrderAsync(orderId, reason);
        }

        public async Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId)
        {
            return await _orderRepository.CheckOrderBelongsToUserAsync(orderId, userId);
        }
    }
}