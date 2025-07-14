using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface ICartService
    {
        Task<Cart> GetOrCreateCartAsync(Guid userId);
        Task AddOrUpdateCartItemAsync(Guid userId, Guid productVariantId, int quantity);
        Task RemoveCartItemAsync(Guid userId, Guid cartItemId);
        Task<List<CartItem>> GetCartItemsAsync(Guid userId);
        Task ClearCartAsync(Guid userId);
    }
}
