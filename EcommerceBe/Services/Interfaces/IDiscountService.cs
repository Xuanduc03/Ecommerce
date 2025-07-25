using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IDiscountService
    {
        Task<List<DiscountDto>> GetAllAsync(string userId, string role);
        Task<DiscountDto> GetByIdAsync(Guid discountId, string userId, string role);
        Task<DiscountDto> CreateAsync(CreateDiscountDto dto, string userId, string role);
        Task<DiscountDto> UpdateAsync(Guid discountId, UpdateDiscountDto dto, string userId, string role);
        Task<bool> DeleteAsync(Guid discountId, string userId, string role);
    }
}
