namespace EcommerceBe.Dto
{
    public class CreateReviewDto
    {
        public Guid ProductId { get; set; }
        public int Rating { get; set; } // 1 - 5
        public string? Comment { get; set; } // Nullable
    }

    public class ReviewDto
    {
        public Guid ReviewId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public Guid ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreateAt { get; set; }
        public string? SellerReply { get; set; } // Thêm trường phản hồi
        public DateTime? SellerReplyAt { get; set; } // Thêm thời gian phản hồi
    }

    public class CreateReviewReplyDto
    {
        public Guid ReviewId { get; set; }
        public string Reply { get; set; }
    }

}
