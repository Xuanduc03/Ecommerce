using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface ISellerRepository
    {
        Task AddAsync(Seller seller);
        Task UpdateAsync(Seller seller);
        Task DeleteAsync(Guid sellerId);
        Task<int> SaveChangeAsync();
        Task<List<Seller>> GetAllSellerAsync(string? search, int page, int pageSize);
        Task<Seller?> GetByIdAsync(Guid sellerId);
        Task<Seller?> GetByUserIdAsync(Guid userId);



    }
}
