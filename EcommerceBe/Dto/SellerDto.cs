namespace EcommerceBe.Dto
{
    public class SellerDto
    {
        public Guid SellerId { get; set; }
        public string Status { get; set; }
        public Guid UserId { get; set; }
        public string? Description { get; set; }
        public Guid? ShopId { get; set; }
        public DateTime RequestAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreateAt { get; set; }

        // Thông tin user
        public string? UserFullName { get; set; }
        public string? UserEmail { get; set; }

        // Optional: tên shop nếu có
        public string? ShopName { get; set; }
    }

}
