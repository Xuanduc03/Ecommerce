namespace EcommerceBe.Dto
{
    public class DiscountDto
    {
        public Guid DiscountId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid? OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<Guid> ProductIds { get; set; } = new List<Guid>();
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
    }

    public class CreateDiscountDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid? OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<Guid> ProductIds { get; set; } = new List<Guid>();
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
    }

    public class UpdateDiscountDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid? OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<Guid> ProductIds { get; set; } = new List<Guid>();
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
    }

    public class ApplyDiscountResponseDto
    {
        public DiscountDto Discount { get; set; } = null!;
        public decimal DiscountAmount { get; set; }
    }
}
