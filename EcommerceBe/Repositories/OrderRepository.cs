using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EcommerceBe.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;
        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        // thêm đơn hàng
        public async Task AddOrderAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Order>> GetAllOrderAsync()
        {
            var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.product)
            .Include(o => o.Shop)
            .Include(o => o.User)
            .Include(o => o.ShippingAddress)
                .ThenInclude(addr => addr.user)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders;
        }
        public async Task<Order> GetOrderByIdAsync(Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }
        public async Task<List<Order>> GetOrdersByShopIdAsync(Guid shopId)
        {
            var orders = await _context.Orders
             .Include(o => o.OrderItems)
                 .ThenInclude(oi => oi.product)
             .Include(o => o.Shop)
             .Include(o => o.ShippingAddress)
                 .ThenInclude(addr => addr.user)
                 .Where(x => x.Status == "pending")
                 .ToListAsync();

            return orders;
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.product)
                .Include(o => o.Shop)
                .Include(o => o.ShippingAddress)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateOrderAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Order>> GetOrdersByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _context.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                .Include(o => o.OrderItems)
                .ToListAsync();
        }

        public async Task DeleteAsync(Order order)
        {
            _context.Orders.Remove(order);
            await Task.CompletedTask;
        }
        public async Task SaveChangeAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task CancelOrderAsync(Guid orderId, string reason)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) throw new Exception("Order not found");
            order.Status = OrderStatus.Cancelled.ToString();
            // Có thể thêm trường Reason nếu model có
            await _context.SaveChangesAsync();
        }
        public async Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId)
        {
            return await _context.Orders.AnyAsync(o => o.OrderId == orderId && o.UserId == userId);
        }

        public async Task<decimal> GetTotalRevenueAsync(Guid shopId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Orders
                .Where(o => o.ShopId == shopId && o.Status == OrderStatus.Delivered.ToString());

            if (startDate.HasValue)
                query = query.Where(o => o.CreatedAt >= startDate);
            if (endDate.HasValue)
                query = query.Where(o => o.CreatedAt <= endDate);

            return await query.SumAsync(o => o.TotalAmount);
        }

        public async Task<OrderStatusStatsDto> GetOrderStatusStatsAsync(Guid shopId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Orders.Where(o => o.ShopId == shopId);

            if (startDate.HasValue)
                query = query.Where(o => o.CreatedAt >= startDate);
            if (endDate.HasValue)
                query = query.Where(o => o.CreatedAt <= endDate);

            var statusCounts = await query
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return new OrderStatusStatsDto
            {
                PendingCount = statusCounts.FirstOrDefault(s => s.Status == OrderStatus.Pending.ToString())?.Count ?? 0,
                ConfirmedCount = statusCounts.FirstOrDefault(s => s.Status == OrderStatus.Confirmed.ToString())?.Count ?? 0,
                ShippingCount = statusCounts.FirstOrDefault(s => s.Status == OrderStatus.Shipping.ToString())?.Count ?? 0,
                DeliveredCount = statusCounts.FirstOrDefault(s => s.Status == OrderStatus.Delivered.ToString())?.Count ?? 0,
                CancelledCount = statusCounts.FirstOrDefault(s => s.Status == OrderStatus.Cancelled.ToString())?.Count ?? 0
            };
        }

        public async Task<int> GetTotalOrdersAsync(Guid shopId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Orders.Where(o => o.ShopId == shopId);
            if (startDate.HasValue)
                query = query.Where(o => o.CreatedAt >= startDate);
            if (endDate.HasValue)
                query = query.Where(o => o.CreatedAt <= endDate);
            return await query.CountAsync();
        }

        public async Task<List<Order>> GetOrdersBySellerIdAsync(Guid sellerId)
        {
            return await _context.Orders
                .Include(o => o.ShippingAddress)
                .ThenInclude(sa => sa.user)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.product)
                .Include(o => o.Shop)
                .Where(o => o.Shop.SellerId == sellerId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Shop?> GetShopBySellerIdAsync(Guid sellerId)
        {
            return await _context.Shops
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);
        }

    }
}

