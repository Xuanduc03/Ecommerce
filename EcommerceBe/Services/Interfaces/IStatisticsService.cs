using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IStatisticsService
    {
        Task<AdminStatisticsDto> GetAdminStatisticsAsync();
        Task<SellerStatisticsDto> GetSellerStatisticsAsync(Guid sellerId);
    }
}
