namespace EcommerceBe.Models
{
    public class ShippingAddress
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Street { get; set; }         // Số nhà, tên đường
        public string Ward { get; set; }           // Phường/Xã
        public string District { get; set; }       // Quận/Huyện
        public string City { get; set; }           // Tỉnh/TP
        public bool IsDefault { get; set; } = false;
        public User user { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

}
