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
                ParentCategoryId = c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory?.Name,
                Slug = c.Slug,
                MetaTitle = c.MetaTitle,
                MetaDescription = c.MetaDescription,
                ImageUrl = c.ImageUrl,
                ThumbnailUrl = c.ThumbnailUrl,
                ProductCount = c.Products?.Count ?? 0
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
                ParentCategoryId = category.ParentCategoryId,
                ParentCategoryName = category.ParentCategory?.Name,
                Slug = category.Slug,
                MetaTitle = category.MetaTitle,
                MetaDescription = category.MetaDescription,
                ImageUrl = category.ImageUrl,
                ThumbnailUrl = category.ThumbnailUrl,
                ProductCount = category.Products?.Count ?? 0
            };
        }

        public async Task<CategoryDto?> GetBySlug(string slug)
        {
            var category = await _repo.GetSlugAsync(slug);
            if (category == null)
                throw new Exception("Không tìm thấy danh mục");

            var dto = new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                ParentCategoryName = category.ParentCategory?.Name,
                Slug = category.Slug,
                MetaTitle = category.MetaTitle,
                MetaDescription = category.MetaDescription,
                ImageUrl = category.ImageUrl,
                ThumbnailUrl = category.ThumbnailUrl,
                ProductCount = category.Products?.Count ?? 0,

                // ✅ Map SubCategories nếu có
                SubCategories = category.SubCategories?
                    .Select(sub => new CategoryDto
                    {
                        CategoryId = sub.CategoryId,
                        Name = sub.Name,
                        Slug = sub.Slug,
                        ImageUrl = sub.ImageUrl,
                        ParentCategoryId = sub.ParentCategoryId,
                        ProductCount = sub.Products?.Count ?? 0
                    }).ToList()
            };

            return dto;
        }


        public async Task<bool> CreateAsync(CreateCategoryDto dto)
        {
            try
            {
                var category = new Category
                {
                    CategoryId = Guid.NewGuid(),
                    Name = dto.Name,
                    Description = dto.Description,
                    ParentCategoryId = dto.ParentCategoryId,
                    Slug = dto.Slug,
                    MetaTitle = dto.MetaTitle,
                    MetaDescription = dto.MetaDescription,
                    ImageUrl = dto.ImageUrl,
                    ThumbnailUrl = dto.ThumbnailUrl,
                    SubCategories = new List<Category>()
                };

                await _repo.AddAsync(category);
                await _repo.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Ghi chi tiết lỗi
                throw new Exception("Lỗi khi lưu danh mục", ex);
            }
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateCategoryDto dto)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null) return false;

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;
            category.Slug = dto.Slug;
            category.MetaTitle = dto.MetaTitle;
            category.MetaDescription = dto.MetaDescription;
            category.ImageUrl = dto.ImageUrl;
            category.ThumbnailUrl = dto.ThumbnailUrl;

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
