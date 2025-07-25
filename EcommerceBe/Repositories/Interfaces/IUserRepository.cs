using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(Guid userId);
        Task<List<User>> GetAllUserAsync(string? search, int page, int pageSize);
        Task<int> GetUserCountAsync(string? search);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task<int> SaveChangeAsync();
        Task<User?> GetByOtpAsync(string otp);

    }
}
