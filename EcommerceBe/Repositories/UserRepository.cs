using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class UserRepository : IUserRepository 
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        // get all user 
        public async Task<List<User>> GetAllUserAsync(string? search, int page, int pageSize)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(u => u.Email.Contains(search) || u.Username.Contains(search));

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

        }

        // đếm số user  
        public async Task<int> GetUserCountAsync(string? search)
        {
            var query = _context.Users.Where(x => x.IsActive == false);
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.Email.Contains(search) || u.Username.Contains(search));
            }
            return await query.CountAsync();    
        }
        // lấy người dùng qua email
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(x => x.Email == email); 
        }
        /// <summary>
        /// Lấy thông tin người dùng theo id
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<User?> GetByIdAsync(Guid userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }
        // lay ma otp cua user
        public async Task<User?> GetByOtpAsync(string otp)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Otp == otp);
        }
        // them user
        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }
        // cap nhat user
        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
        }
        public async Task<int> SaveChangeAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await Task.CompletedTask;
        }
    }
}
