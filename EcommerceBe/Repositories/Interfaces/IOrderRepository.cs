using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task AddOrderAsync(Order order);
        Task<Order> GetOrderByIdAsync(Guid orderId);
        Task<List<Order>> GetOrdersByUserIdAsync(Guid userId);
        Task UpdateOrderAsync(Order order);
        Task<List<Order>> GetAllOrderAsync(string? search, int page, int pageSize);
        Task<List<Order>> GetOrdersByDateRangeAsync(DateTime from, DateTime to);
        Task CancelOrderAsync(Guid orderId, string reason);
        Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId);
    }
}
