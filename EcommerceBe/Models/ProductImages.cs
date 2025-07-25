using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class ProductImages
    {
        public Guid ProductImageId { get; set; }
        public Guid ProductId { get; set; }
        public string ImageUrl { get; set; }
        public bool IsPrimary { get; set; }
        public Product Product { get; set; }
    }
}
