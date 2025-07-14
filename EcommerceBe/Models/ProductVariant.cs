using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class ProductVariant
    {
        public Guid ProductVariantId { get; set; }
        public Guid ProductId { get; set; } // id sản phẩm
        public string Size { get; set; } // kích thước
        public string ColorCode { get; set; } // mã màu của sản phẩm 
        public string ColorName { get; set; } // tên màu của sản phẩm
        public int StockQuantity { get; set; } // số lượng hàng tồn kho 
        public int ViewsCount { get; set; } // số lượt xem sản phẩm 
        public int SalesCount { get; set; } // số lượng sản phẩm đã bán
        public bool BrandNew { get; set; } // sản phẩm mới 
        public string Features { get; set; } 
        public decimal Price { get; set; }
        public string SeoDescription { get; set; }
        public Product Product { get; set; }
        public ICollection<OrderItem>  OrderItems { get; set; }
    }
}
