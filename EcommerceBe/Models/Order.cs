using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Order
    {
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public Guid ShopId { get; set; }
        public Guid ShippingAddressId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; } // "pending", "processing", "shipped", "delivered", "cancelled"

        public User User { get; set; }
        public Shop Shop { get; set; }
        public ShippingAddress ShippingAddress { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<Payment> Payments { get; set; }
    }
}
