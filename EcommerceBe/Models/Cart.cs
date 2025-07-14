namespace EcommerceBe.Models
{
    public class Cart
    {
        public Guid CartId { get; set; }
        public Guid UserId { get; set; }         // Nếu đăng nhập, hoặc null nếu anonymous
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public User User { get; set; }
        public virtual List<CartItem> CartItems { get; set; }
    }
}
