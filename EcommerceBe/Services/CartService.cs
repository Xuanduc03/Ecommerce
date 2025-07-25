using EcommerceBe.Dto;
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

        private async Task<Cart> GetOrCreateCartEntityAsync(Guid userId)
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

        public async Task<CartResponseDto> GetCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId, includeDetails: true);
            if (cart == null) return new CartResponseDto { CartId = Guid.Empty, Items = new List<CartItemResponseDto>() };

            return MapToCartResponseDto(cart);
        }

        public async Task<CartResponseDto> AddOrUpdateCartItemAsync(Guid userId, Guid productVariantId, int quantity)
        {
            if (quantity <= 0)
                throw new Exception("Quantity must be greater than 0");

            var cart = await GetOrCreateCartEntityAsync(userId);
            var variant = await _productRepository.GetProductVariantByIdAsync(productVariantId);
            if (variant == null) throw new Exception("Product variant not found");

            if (variant.StockQuantity < quantity)
                throw new Exception("Insufficient stock");

            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductVariantId == productVariantId);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                existingItem.Price = variant.Price;
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
                    Price = variant.Price,
                    AddedAt = DateTime.UtcNow
                };
                await _cartRepository.AddCartItemAsync(cartItem);
            }

            variant.StockQuantity -= quantity;
            await _productRepository.UpdateProductVariantAsync(variant);

            var updatedCart = await _cartRepository.GetCartByUserIdAsync(userId, includeDetails: true);
            return MapToCartResponseDto(updatedCart);
        }

        public async Task<CartResponseDto> UpdateCartItemQuantityAsync(Guid userId, Guid cartItemId, int newQuantity)
        {
            if (newQuantity <= 0)
                throw new Exception("Quantity must be greater than 0");

            var cart = await _cartRepository.GetCartByUserIdAsync(userId, includeDetails: true);
            var item = cart?.CartItems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
            if (item == null) throw new Exception("CartItem not found");

            var variant = await _productRepository.GetProductVariantByIdAsync(item.ProductVariantId);
            if (variant == null) throw new Exception("Product variant not found");

            // Hoàn trả tồn kho cũ trước khi tính toán
            variant.StockQuantity += item.Quantity;

            if (variant.StockQuantity < newQuantity)
                throw new Exception("Insufficient stock");

            item.Quantity = newQuantity;
            variant.StockQuantity -= newQuantity;

            await _cartRepository.UpdateCartItemAsync(item);
            await _productRepository.UpdateProductVariantAsync(variant);

            return MapToCartResponseDto(cart);
        }

        public async Task RemoveCartItemAsync(Guid userId, Guid cartItemId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId, includeDetails: true);
            var item = cart?.CartItems.FirstOrDefault(ci => ci.CartItemId == cartItemId);
            if (item == null) throw new Exception("CartItem not found");

            var variant = await _productRepository.GetProductVariantByIdAsync(item.ProductVariantId);
            if (variant != null)
            {
                variant.StockQuantity += item.Quantity; // trả lại tồn kho
                await _productRepository.UpdateProductVariantAsync(variant);
            }

            await _cartRepository.DeleteCartItemAsync(cartItemId);
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId, includeDetails: true);
            if (cart != null)
            {
                foreach (var item in cart.CartItems.ToList())
                {
                    var variant = await _productRepository.GetProductVariantByIdAsync(item.ProductVariantId);
                    if (variant != null)
                    {
                        variant.StockQuantity += item.Quantity;
                        await _productRepository.UpdateProductVariantAsync(variant);
                    }
                    await _cartRepository.DeleteCartItemAsync(item.CartItemId);
                }
            }
        }

        // Helper để map sang DTO
        private CartResponseDto MapToCartResponseDto(Cart cart)
        {
            return new CartResponseDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Items = cart.CartItems.Select(ci => new CartItemResponseDto
                {
                    CartItemId = ci.CartItemId,
                    ProductVariantId = ci.ProductVariantId,
                    ProductName = ci.ProductVariant?.Product?.ProductName,
                    Size = ci.ProductVariant?.Size,
                    ColorName = ci.ProductVariant?.ColorName,
                    ColorCode = ci.ProductVariant?.ColorCode,
                    ImageUrl = ci.ProductVariant?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl,
                    Price = ci.Price,
                    Quantity = ci.Quantity
                }).ToList()
            };
        }
    }
}
