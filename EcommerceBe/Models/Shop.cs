using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Shop
    {
        public Guid ShopId { get; set; }
        public Guid SellerId { get; set; }

        // 1. Thông tin cơ bản
        public string Name { get; set; }          // Tên shop (bắt buộc)
        public string Description { get; set; }   // Mô tả ngắn
        public string LogoUrl { get; set; }
        public string? BannerUrl { get; set; } 

        // 2. Liên hệ tối thiểu
        public string ContactPhone { get; set; }  // SĐT liên hệ (bắt buộc)

        // 3. Trạng thái
        public bool IsActive { get; set; } = true; // Mặc định active khi tạo
        public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Seller Seller { get; set; }
        public ICollection<Product> Products { get; set; }   
        public ICollection<Order> Orders { get; set; }
        public ICollection<Discount>  Discounts { get; set; }

    }
}
