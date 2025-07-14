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

        public async Task<List<Order>> GetAllOrderAsync(string? search, int page, int pageSize)
        {
            var query = _context.Orders.Where(x => x.Status == "pending").AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x => x.PaymentMethod.Contains(search));
            }
            return await query.Skip((page -1) * pageSize).Take(pageSize).ToListAsync();
        }
        public async Task<Order> GetOrderByIdAsync(Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductVariant)
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

       

    }
}
