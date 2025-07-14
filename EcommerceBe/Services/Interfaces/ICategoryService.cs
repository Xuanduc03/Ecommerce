using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(Guid id);
        Task<bool> CreateAsync(CreateCategoryDto dto);
        Task<bool> UpdateAsync(Guid id, CreateCategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
