using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Seller
    {
        public Guid SellerId { get; set; }
        public string Status { get; set; }
        [ForeignKey("UserId")]
        public Guid UserId { get; set; }
        public string? Description { get; set; }
        public Guid? ShopId { get; set; }
        public DateTime RequestAt { get; set; }
        public DateTime? ApprovedAt { get; set; } 
        public DateTime CreateAt { get; set; }
        public User User { get; set; }
        public Shop Shop { get; set; }
    }
}
