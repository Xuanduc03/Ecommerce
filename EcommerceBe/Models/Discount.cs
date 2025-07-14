using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Discount
    {
        public Guid DiscountId { get; set; }
        public string Name { get; set; }
        public Guid OrderId {  get; set; }
        public Guid ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Shop Shop { get; set; }
        public Order Order { get; set; }


    }
}
