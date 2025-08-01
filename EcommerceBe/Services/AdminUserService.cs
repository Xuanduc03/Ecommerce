using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly IUserRepository _repo;
        private readonly ISellerRepository _seller;
        private readonly AppDbContext _context;
        public AdminUserService(IUserRepository repo, ISellerRepository sellerRepository)
        {
            _repo = repo;
            _seller = sellerRepository;
        }


        public async Task<bool> CreateUserAsync(RegisterDto model)
        {
            // 1. Check email trùng
            if (await _repo.GetByEmailAsync(model.Email) is not null)
                throw new InvalidOperationException("Email đã được sử dụng.");

            var userId = Guid.NewGuid();

            var newUser = new User
            {
                UserId = userId,
                Email = model.Email,
                Username = model.Username,
                PhoneNumber = model.PhoneNumber,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Role = model.Role,
                IsActive = true,
                CreateAt = DateTime.UtcNow,
            };

            await _repo.AddAsync(newUser);
            await _repo.SaveChangeAsync();

            // 2. Nếu là Seller, tạo Seller record, ShopId = null
            if (model.Role == UserRole.Seller)
            {
                var seller = new Seller
                {
                    SellerId = Guid.NewGuid(),
                    UserId = userId,
                    Status = "Chờ duyệt",
                    ShopId = null,
                    RequestAt = DateTime.UtcNow,
                    CreateAt = DateTime.UtcNow,
                    ApprovedAt = null
                };

                await _seller.AddAsync(seller);
                await _seller.SaveChangeAsync();
            }
            return true;
        }

        public async Task<bool> UpdateUserAsync(Guid userId, AdminUpdateUser model)
        {
            var user = await _repo.GetByIdAsync(userId);

            if (user == null)
                throw new InvalidOperationException("Không tìm thấy người dùng.");

            user.Email = model.Email;
            user.Username = model.Username;
            user.PhoneNumber = model.PhoneNumber;
            user.IsVerified = model.IsVerified;
            user.IsActive = model.IsActive;
            user.Role = model.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(user);
            await _repo.SaveChangeAsync();

            return true;
        }
        public async Task<PagedResultDto<User>> GetUsersAsync(string? search, int page, int pageSize)
        {
            var users = await _repo.GetAllUserAsync(search, page, pageSize);
            var total = await _repo.GetUserCountAsync(search);

            return new PagedResultDto<User>
            {
                Items = users,
                TotalCount = total
            };
        }

        public async Task<User> GetUserByIdAsync(Guid userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");
            return user;
        }

        public async Task UpdateUserRoleAsync(Guid userId, string newRole)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            if (!Enum.TryParse<UserRole>(newRole, true, out var parsedRole))
                throw new Exception("Invalid role");

            user.Role = parsedRole;
            await _repo.UpdateAsync(user);
        }


        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            await _repo.DeleteAsync(user);
            await _repo.SaveChangeAsync();
            return true;
        }
    }
}
