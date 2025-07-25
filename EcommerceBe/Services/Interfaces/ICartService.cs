using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
        public interface ICartService
        {
            // Lấy giỏ hàng chi tiết theo user
            Task<CartResponseDto> GetCartAsync(Guid userId);

            // Thêm hoặc cập nhật sản phẩm trong giỏ
            Task<CartResponseDto> AddOrUpdateCartItemAsync(Guid userId, Guid productVariantId, int quantity);

            // Cập nhật số lượng của 1 item
            Task<CartResponseDto> UpdateCartItemQuantityAsync(Guid userId, Guid cartItemId, int newQuantity);

            // Xóa 1 item khỏi giỏ
            Task RemoveCartItemAsync(Guid userId, Guid cartItemId);

            // Xóa toàn bộ giỏ hàng
            Task ClearCartAsync(Guid userId);
        }
}
