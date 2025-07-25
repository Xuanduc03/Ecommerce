namespace EcommerceBe.Dto
{
    public class DiscountDto
    {
        public Guid DiscountId { get; set; }
        public string Name { get; set; }
        public Guid OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class CreateDiscountDto
    {
        public string Name { get; set; }
        public Guid OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class UpdateDiscountDto
    {
        public string Name { get; set; }
        public Guid OrderId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
