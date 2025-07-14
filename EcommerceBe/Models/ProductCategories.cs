using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class ProductCategories
    {
        public Guid ProductId { get; set; }
        public Guid CategoryId { get; set; }
        public Product Product { get; set; }
        public Category Category { get; set; }
    }
}
