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
        Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid sellerId);
        Task DeleteOrderAsync(Guid orderId);
        Task UpdateOrderStatusAsync(Guid orderId, string status);
        Task UpdateSellerOrderStatusAsync(Guid orderId, string status, Guid sellerId);
        Task CancelOrderAsync(Guid orderId, string reason);
        Task<bool> CheckOrderBelongsToUserAsync(Guid orderId, Guid userId);
        Task<bool> CheckOrderBelongsToSellerAsync(Guid orderId, Guid sellerId);
    }
}
