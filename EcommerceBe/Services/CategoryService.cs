using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }
        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var categories = await _repo.GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                ParentCategoryId = c.ParentCategoryId
            }).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId
            };
        }

        public async Task<bool> CreateAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                CategoryId = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                ParentCategoryId = dto.ParentCategoryId,
                SubCategories = new List<Category>()
            };

            await _repo.AddAsync(category);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, CreateCategoryDto dto)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null) return false;

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;

            await _repo.UpdateAsync(category);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null) return false;

            await _repo.DeleteAsync(category);
            await _repo.SaveChangesAsync();
            return true;
        }
    }
}
