using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface IAdminUserService
    {
        Task<PagedResultDto<User>> GetUsersAsync(string? search, int page, int pageSize);
        Task<User> GetUserByIdAsync(Guid userId);
        Task UpdateUserRoleAsync(Guid userId, string newRole);
        Task DeleteUserAsync(Guid userId);
        Task<bool> UpdateUserAsync(Guid userId, AdminUpdateUser model);
        Task<bool> CreateUserAsync(RegisterDto user);
    }
}
