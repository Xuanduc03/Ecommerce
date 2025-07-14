using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{

    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(Guid userId);
        Task<Cart?> GetCartByIdAsync(Guid cartId);
        Task AddCartAsync(Cart cart);
        Task UpdateCartAsync(Cart cart);
        Task DeleteCartAsync(Guid cartId);
        Task AddCartItemAsync(CartItem cartItem);
        Task<CartItem?> GetCartItemAsync(Guid cartItemId);
        Task UpdateCartItemAsync(CartItem cartItem);
        Task DeleteCartItemAsync(Guid cartItemId);
    }
}
