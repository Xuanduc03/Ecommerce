using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public class Review
    {
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public Guid ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreateAt { get; set; }
        public string? SellerReply { get; set; } // Nội dung phản hồi của seller
        public DateTime? SellerReplyAt { get; set; } // Thời gian phản hồi
        public User user { get; set; }
        public Product product { get; set; }
    }
}
