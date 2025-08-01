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
         
        // create order
        public async Task<List<Guid>> CreateOrderAsync(Guid userId, OrderCreateDto dto)
        {
            var orders = new List<Guid>();
            var groupedItems = dto.cartItems.GroupBy(x => x.ShopId);

            foreach (var group in groupedItems)
            {
                var shopId = group.Key;
                var orderItems = new List<OrderItem>();
                decimal totalAmount = 0;

                foreach (var item in group)
                {
                    var product = await _productRepository.GetByIdAsync(item.ProductId);
                    if (product == null)
                        throw new Exception($"Product {item.ProductId} not found");

                    if (product.StockQuantity < item.Quantity)
                        throw new Exception($"Not enough stock for product: {item.ProductId}");

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
                    CreatedAt = DateTime.UtcNow,
                    OrderDate = DateTime.UtcNow,
                    PaymentMethod = dto.PaymentMethod,
                    Status = "Pending",
                    TotalAmount = totalAmount,
                    OrderItems = orderItems,
                    ShippingAddressId = dto.ShippingAddressId // nếu bạn vẫn dùng Id, hoặc build từ địa chỉ thô
                };

                await _orderRepository.AddOrderAsync(order);
                orders.Add(order.OrderId);
            }

            return orders;
        }

        // get all order for admin using
        public async Task<List<ReponseOrderAllDto>> GetAllOrderAsync()
        {
            try
            {
                var orders = await _orderRepository.GetAllOrderAsync();
                if (orders == null || !orders.Any())
                {
                    throw new Exception("Không có đơn hàng nào");
                }

                return orders.Select(o => new ReponseOrderAllDto
                {
                    OrderId = o.OrderId,
                    CreatedAt = o.CreatedAt,
                    ShippingAddress = o.ShippingAddress != null
                        ? $"{o.ShippingAddress.FullName}, {o.ShippingAddress.PhoneNumber}, {o.ShippingAddress.Street}, {o.ShippingAddress.Ward}, {o.ShippingAddress.District}, {o.ShippingAddress.City}"
                        : "",
                    PaymentMethod = o.PaymentMethod,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    UserName = o.ShippingAddress?.user?.FullName ?? "",
                    Items = o.OrderItems.Select(oi => new ReponseOrderItemDto
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.product?.ProductName ?? "", // Include Product trước nhé
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                }).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy danh sách đơn hàng", ex);
            }
        }

        // get order by id 
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
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        // get all order by shop
        public async Task<List<ReponseOrderAllDto>> GetOrdersByShopIdAsync(Guid shopId)
        {
            var orders = await _orderRepository.GetOrdersByShopIdAsync(shopId);
            if (orders == null || !orders.Any())
            {
                throw new Exception("Không có đơn hàng nào");
            }

            return orders.Select(o => new ReponseOrderAllDto
            {
                OrderId = o.OrderId,
                CreatedAt = o.CreatedAt,
                ShippingAddress = o.ShippingAddress != null
                    ? $"{o.ShippingAddress.FullName}, {o.ShippingAddress.PhoneNumber}, {o.ShippingAddress.Street}, {o.ShippingAddress.Ward}, {o.ShippingAddress.District}, {o.ShippingAddress.City}"
                    : "",
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                UserName = o.ShippingAddress?.user?.FullName ?? "",
                Items = o.OrderItems.Select(oi => new ReponseOrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.product?.ProductName ?? "", // Include Product trước nhé
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }

        // get order for user
        public async Task<List<ReponseOrderAllDto>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);

            return orders.Select(o => new ReponseOrderAllDto
            {
                OrderId = o.OrderId,
                CreatedAt = o.CreatedAt,
                ShippingAddress = o.ShippingAddress != null
                    ? $"{o.ShippingAddress.FullName}, {o.ShippingAddress.PhoneNumber}, {o.ShippingAddress.Street}, {o.ShippingAddress.Ward}, {o.ShippingAddress.District}, {o.ShippingAddress.City}"
                    : "",
                PaymentMethod = o.PaymentMethod,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                UserName = o.ShippingAddress?.user?.FullName ?? "",
                Items = o.OrderItems.Select(oi => new ReponseOrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.product?.ProductName ?? "", // Include Product trước nhé
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
