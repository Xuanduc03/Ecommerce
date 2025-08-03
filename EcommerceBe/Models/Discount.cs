using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public enum DiscountType
    {
        Percentage, // Giảm theo phần trăm
        FixedAmount // Giảm số tiền cố định
    }

    public class Discount
    {
        public Guid DiscountId { get; set; }
        public string Name { get; set; }
        public Guid? OrderId { get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ICollection<Product> Products { get; set; }
        public Shop Shop { get; set; }
        public Order Order { get; set; }
        public DiscountType DiscountType { get; set; } // Loại giảm giá
        public virtual ICollection<DiscountProduct> DiscountProducts { get; set; } = new List<DiscountProduct>();
        public decimal DiscountValue { get; set; } // Giá trị giảm (%, VNĐ)
    }
}
