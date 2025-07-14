using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class ShippingAddressService : IShippingAddressService
    {
        private readonly IShippingAddressRepository _repo;
        public ShippingAddressService(IShippingAddressRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<AddressDto>> GetAddressesAsync(Guid userId)
        {
            var list = await _repo.GetByUserIdAsync(userId);
            return list.Select(a => new AddressDto
            {
                Id = a.Id,
                FullName = a.FullName,
                PhoneNumber = a.PhoneNumber,
                Street = a.Street,
                Ward = a.Ward,
                District = a.District,
                City = a.City,
                IsDefault = a.IsDefault
            }).ToList();
        }

        public async Task<bool> CreateAsync(Guid userId, CreateAddressDto dto)
        {
            if (dto.IsDefault)
            {
                await _repo.UnsetDefaultAsync(userId);
            }

            var address = new ShippingAddress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Street = dto.Street,
                Ward = dto.Ward,
                District = dto.District,
                City = dto.City,
                IsDefault = dto.IsDefault,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(address);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, Guid userId, UpdateAddressDto dto)
        {
            var address = await _repo.GetByIdAsync(id);

            if (address == null || address.UserId != userId)
                throw new UnauthorizedAccessException("Không thể cập nhật địa chỉ.");

            if (dto.IsDefault)
            {
                await _repo.UnsetDefaultAsync(userId);
            }

            address.FullName = dto.FullName;
            address.PhoneNumber = dto.PhoneNumber;
            address.Street = dto.Street;
            address.Ward = dto.Ward;
            address.District = dto.District;
            address.City = dto.City;
            address.IsDefault = dto.IsDefault;
            address.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(address);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var address = await _repo.GetByIdAsync(id);
            if (address == null || address.UserId != userId)
                throw new UnauthorizedAccessException("Không thể xóa địa chỉ.");

            await _repo.DeleteAsync(address);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetDefaultAsync(Guid id, Guid userId)
        {
            var address = await _repo.GetByIdAsync(id);
            if (address == null || address.UserId != userId)
                throw new UnauthorizedAccessException("Không tìm thấy địa chỉ.");

            await _repo.UnsetDefaultAsync(userId);
            address.IsDefault = true;
            address.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(address);
            await _repo.SaveChangesAsync();
            return true;
        }
    }
}
