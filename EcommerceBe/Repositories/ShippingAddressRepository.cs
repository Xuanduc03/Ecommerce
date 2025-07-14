using EcommerceBe.Database;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Repositories
{
    public class ShippingAddressRepository : IShippingAddressRepository
    {
        private readonly AppDbContext _context;

        public ShippingAddressRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ShippingAddress>> GetByUserIdAsync(Guid userId)
        {
            return await _context.ShippingAddresses
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.IsDefault)
                .ToListAsync();
        }
        public async Task<ShippingAddress?> GetByIdAsync(Guid id)
        {
            return await _context.ShippingAddresses.FindAsync(id);
        }

        public async Task AddAsync(ShippingAddress address){
            await _context.ShippingAddresses.AddAsync(address); 
        }
        public async Task UpdateAsync(ShippingAddress address){
            _context.ShippingAddresses.Update(address);
            await Task.CompletedTask;
        }
        public async Task DeleteAsync(ShippingAddress address){
            _context.ShippingAddresses.Remove(address);
            await Task.CompletedTask;
        }
        public async Task UnsetDefaultAsync(Guid userId){
            var currentDefault = await _context.ShippingAddresses.FirstOrDefaultAsync(x => x.UserId == userId && x.IsDefault);
            if(currentDefault != null)
            {
                currentDefault.IsDefault = false;
            }
        }
        public async Task SaveChangesAsync(){
            await _context.SaveChangesAsync();
        }

    }
}
