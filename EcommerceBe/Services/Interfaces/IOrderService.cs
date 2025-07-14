using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface IOrderService
    {
        Task<Guid> CreateOrderAsync(Guid userId, OrderCreateDto dto);
        Task<OrderDto> GetOrderByIdAsync(Guid orderId);
        Task<List<OrderDto>> GetOrdersByUserIdAsync(Guid userId);
        Task UpdateOrderStatusAsync(Guid orderId, string status);
        Task CancelOrderAsync(Guid orderId, string reason);
        Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId);
    }
}
