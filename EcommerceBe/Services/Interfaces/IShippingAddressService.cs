using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IShippingAddressService
    {
        
        Task<List<AddressDto>> GetAddressesAsync(Guid userId);
        Task<bool> CreateAsync(Guid userId, CreateAddressDto dto);
        Task<bool> UpdateAsync(Guid id, Guid userId, UpdateAddressDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<bool> SetDefaultAsync(Guid id, Guid userId);
    }
}
