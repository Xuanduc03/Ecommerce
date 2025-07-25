using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface ISellerService
    {
        Task<PagedResultDto<SellerDto>> GetSellersAsync(string? search, int page, int pageSize);
        Task<SellerDto?> GetSellerByIdAsync(Guid sellerId);
        Task<bool> CreateSellerAsync(SellerDto sellerDto);
        Task<bool> UpdateSellerAsync(Guid sellerId, SellerDto model);
        Task<bool> DeleteSellerAsync(Guid sellerId);
        Task<bool> UpdateSellerStatusAsync(Guid sellerId, string newStatus);
    }
}
