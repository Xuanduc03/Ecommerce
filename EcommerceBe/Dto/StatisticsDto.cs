namespace EcommerceBe.Dto
{
    public class AdminStatisticsDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }

    public class SellerStatisticsDto
    {
        public int TotalProducts { get; set; }
        public int TotalSoldOrders { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }
}