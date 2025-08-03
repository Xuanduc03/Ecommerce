using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface IOrderService
    {
        Task<List<ReponseOrderAllDto>> GetAllOrderAsync();
        Task<List<Guid>> CreateOrderAsync(Guid userId, OrderCreateDto dto);
        Task<OrderDto> GetOrderByIdAsync(Guid orderId);
        Task<List<ReponseOrderAllDto>> GetOrdersByUserIdAsync(Guid userId);
        Task<List<ReponseOrderAllDto>> GetOrdersByShopIdAsync(Guid shopId);
        Task DeleteOrderAsync(Guid orderId);
        Task UpdateOrderStatusAsync(Guid orderId, string status);
        Task CancelOrderAsync(Guid orderId, string reason);
        Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId);
    }
}
