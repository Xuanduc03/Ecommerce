using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IDiscountRepository _discountRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DiscountService(IDiscountRepository discountRepository, IHttpContextAccessor httpContextAccessor)
        {
            _discountRepository = discountRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetShopIdForUser(string userId)
        {
            // Giả định: Lấy ShopId từ cơ sở dữ liệu dựa trên UserId
            // Thay thế bằng logic thực tế của bạn, ví dụ: truy vấn bảng Shop
            return Guid.NewGuid(); // Placeholder
        }

        public async Task<List<DiscountDto>> GetAllAsync(string userId, string role)
        {
            Guid? shopId = role == "Admin" ? null : GetShopIdForUser(userId);
            var discounts = await _discountRepository.GetAllAsync(shopId);

            return discounts.Select(d => new DiscountDto
            {
                DiscountId = d.DiscountId,
                Name = d.Name,
                OrderId = d.OrderId,
                ShopId = d.ShopId,
                StartDate = d.StartDate,
                EndDate = d.EndDate
            }).ToList();
        }

        public async Task<DiscountDto> GetByIdAsync(Guid discountId, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return null;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập mã giảm giá này.");
                }
            }

            return new DiscountDto
            {
                DiscountId = discount.DiscountId,
                Name = discount.Name,
                OrderId = discount.OrderId,
                ShopId = discount.ShopId,
                StartDate = discount.StartDate,
                EndDate = discount.EndDate
            };
        }

        public async Task<DiscountDto> CreateAsync(CreateDiscountDto dto, string userId, string role)
        {
            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (dto.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn chỉ có thể tạo mã giảm giá cho shop của mình.");
                }
            }

            var discount = new Discount
            {
                Name = dto.Name,
                OrderId = dto.OrderId,
                ShopId = dto.ShopId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            var createdDiscount = await _discountRepository.CreateAsync(discount);
            return new DiscountDto
            {
                DiscountId = createdDiscount.DiscountId,
                Name = createdDiscount.Name,
                OrderId = createdDiscount.OrderId,
                ShopId = createdDiscount.ShopId,
                StartDate = createdDiscount.StartDate,
                EndDate = createdDiscount.EndDate
            };
        }

        public async Task<DiscountDto> UpdateAsync(Guid discountId, UpdateDiscountDto dto, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return null;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật mã giảm giá này.");
                }
            }

            discount.Name = dto.Name;
            discount.OrderId = dto.OrderId;
            discount.StartDate = dto.StartDate;
            discount.EndDate = dto.EndDate;

            var updatedDiscount = await _discountRepository.UpdateAsync(discountId, discount);
            if (updatedDiscount == null)
            {
                return null;
            }

            return new DiscountDto
            {
                DiscountId = updatedDiscount.DiscountId,
                Name = updatedDiscount.Name,
                OrderId = updatedDiscount.OrderId,
                ShopId = updatedDiscount.ShopId,
                StartDate = updatedDiscount.StartDate,
                EndDate = updatedDiscount.EndDate
            };
        }

        public async Task<bool> DeleteAsync(Guid discountId, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return false;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa mã giảm giá này.");
                }
            }

            return await _discountRepository.DeleteAsync(discountId);
        }
    }
}
