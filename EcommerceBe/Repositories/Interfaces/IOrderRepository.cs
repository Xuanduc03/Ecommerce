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
        Task<List<Order>> GetAllOrderAsync();
        Task<List<Order>> GetOrdersByDateRangeAsync(DateTime from, DateTime to);
        Task CancelOrderAsync(Guid orderId, string reason);
        Task<List<Order>> GetOrdersByShopIdAsync(Guid shopId);
        Task DeleteAsync(Order order);
        Task SaveChangeAsync();
        Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId);


        Task<decimal> GetTotalRevenueAsync(Guid shopId, DateTime? from = null, DateTime? to = null);
        Task<int> GetTotalOrdersAsync(Guid shopId, DateTime? from = null, DateTime? to = null);
        Task<OrderStatusStatsDto> GetOrderStatusStatsAsync(Guid shopId, DateTime? from = null, DateTime? to = null);
    }
}
