using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface ICartRepository
    {
        // Lấy giỏ hàng theo User (có thể load chi tiết sản phẩm nếu cần)
        Task<Cart?> GetCartByUserIdAsync(Guid userId, bool includeDetails = false);

        // Lấy giỏ hàng theo CartId (có thể load chi tiết sản phẩm nếu cần)
        Task<Cart?> GetCartByIdAsync(Guid cartId, bool includeDetails = false);

        // Tạo giỏ hàng mới
        Task AddCartAsync(Cart cart);

        // Cập nhật giỏ hàng (thông tin cơ bản)
        Task UpdateCartAsync(Cart cart);

        // Xóa giỏ hàng
        Task DeleteCartAsync(Guid cartId);

        // Thêm item (nếu đã có productVariantId thì tự động gộp số lượng)
        Task AddCartItemAsync(CartItem cartItem);

        // Lấy chi tiết CartItem (kèm Product và ProductImages nếu cần)
        Task<CartItem?> GetCartItemAsync(Guid cartItemId, bool includeDetails = false);

        // Cập nhật CartItem (số lượng, giá)
        Task UpdateCartItemAsync(CartItem cartItem);

        // Xóa một CartItem và trả về để xử lý tồn kho
        Task<CartItem?> DeleteCartItemAsync(Guid cartItemId);

        // Xóa tất cả CartItem trong giỏ
        Task DeleteAllCartItemsAsync(Guid cartId);
    }
}
