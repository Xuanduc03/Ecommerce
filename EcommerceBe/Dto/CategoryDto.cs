using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{
    public class CategoryDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required] public string Name { get; set; }
        public string? Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
    }
}
