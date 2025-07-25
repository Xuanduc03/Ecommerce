using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;

        public CartRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartByUserIdAsync(Guid userId, bool includeDetails = false)
        {
            var query = _context.Carts.AsQueryable();

            if (includeDetails)
            {
                query = query
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.ProductVariant.Product.ProductImages);
            }
            else
            {
                query = query.Include(c => c.CartItems);
            }

            return await query.FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart?> GetCartByIdAsync(Guid cartId, bool includeDetails = false)
        {
            var query = _context.Carts.AsQueryable();

            if (includeDetails)
            {
                query = query
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.ProductVariant)
                            .ThenInclude(pv => pv.Product)
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.ProductVariant.Product.ProductImages);
            }
            else
            {
                query = query.Include(c => c.CartItems);
            }

            return await query.FirstOrDefaultAsync(c => c.CartId == cartId);
        }

        public async Task AddCartAsync(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCartAsync(Cart cart)
        {
            _context.Carts.Update(cart);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCartAsync(Guid cartId)
        {
            var cart = await _context.Carts.FindAsync(cartId);
            if (cart != null)
            {
                _context.Carts.Remove(cart);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddCartItemAsync(CartItem cartItem)
        {
            // Kiểm tra duplicate productVariantId để tránh trùng
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartItem.CartId && ci.ProductVariantId == cartItem.ProductVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += cartItem.Quantity;
                existingItem.Price = cartItem.Price;
                _context.CartItems.Update(existingItem);
            }
            else
            {
                await _context.CartItems.AddAsync(cartItem);
            }
            await _context.SaveChangesAsync();
        }

        public async Task<CartItem?> GetCartItemAsync(Guid cartItemId, bool includeDetails = false)
        {
            var query = _context.CartItems.AsQueryable();

            if (includeDetails)
            {
                query = query.Include(ci => ci.ProductVariant)
                             .ThenInclude(pv => pv.Product)
                             .Include(ci => ci.ProductVariant.Product.ProductImages);
            }
            else
            {
                query = query.Include(ci => ci.ProductVariant);
            }

            return await query.FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);
        }

        public async Task UpdateCartItemAsync(CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
        }

        public async Task<CartItem?> DeleteCartItemAsync(Guid cartItemId)
        {
            var item = await _context.CartItems.FindAsync(cartItemId);
            if (item != null)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();
            }
            return item; // trả về để service xử lý tồn kho
        }

        public async Task DeleteAllCartItemsAsync(Guid cartId)
        {
            var items = await _context.CartItems.Where(ci => ci.CartId == cartId).ToListAsync();
            if (items.Any())
            {
                _context.CartItems.RemoveRange(items);
                await _context.SaveChangesAsync();
            }
        }
    }
}
