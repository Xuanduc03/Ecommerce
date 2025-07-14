using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;

        private readonly IProductRepository _productRepository;
        public CartService(ICartRepository cartRepository, IProductRepository productRepository)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
        }

        public async Task<Cart> GetOrCreateCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                cart = new Cart
                {
                    CartId = Guid.NewGuid(),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    CartItems = new List<CartItem>()
                };
                await _cartRepository.AddCartAsync(cart);
            }
            return cart;
        }

        // thêm hoặc cập nhật giỏ hàng
        public async Task AddOrUpdateCartItemAsync(Guid userId, Guid productVariantId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);
            var variant = await _productRepository.GetProductVariantByIdAsync(productVariantId);
            if (variant == null)
                throw new Exception("Product variant not found");

            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductVariantId == productVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                existingItem.Price = variant.Price; // Optional: cập nhật lại giá nếu cần
                await _cartRepository.UpdateCartItemAsync(existingItem);
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartItemId = Guid.NewGuid(),
                    CartId = cart.CartId,
                    ProductVariantId = productVariantId,
                    Quantity = quantity,
                    Price = variant.Price, // Lấy giá từ ProductVariant nếu cần
                    AddedAt = DateTime.UtcNow
                };
                await _cartRepository.AddCartItemAsync(cartItem);
            }
        }

        public async Task RemoveCartItemAsync(Guid userId, Guid cartItemId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart == null) throw new Exception("Cart not found");

            var item = cart.CartItems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
            if (item == null) throw new Exception("CartItem not found");

            await _cartRepository.DeleteCartItemAsync(cartItemId);
        }

        public async Task<List<CartItem>> GetCartItemsAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            return cart?.CartItems ?? new List<CartItem>();
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart != null)
            {
                foreach (var item in cart.CartItems.ToList())
                {
                    await _cartRepository.DeleteCartItemAsync(item.CartItemId);
                }
            }
        }
    }
}
