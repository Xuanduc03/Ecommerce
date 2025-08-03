using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly AppDbContext _context;

        public StatisticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AdminStatisticsDto> GetAdminStatisticsAsync()
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

            // Tổng đơn hàng
            var totalOrders = await _context.Orders.CountAsync();

            // Đơn hoàn thành
            var completedOrders = await _context.Orders
                .CountAsync(o => o.Status == "delivered");

            // Đơn đã hủy
            var cancelledOrders = await _context.Orders
                .CountAsync(o => o.Status == "cancelled");

            // Doanh thu hôm nay
            var todayRevenue = await _context.Orders
                .Where(o => o.OrderDate.Date == today && o.Status == "delivered")
                .SumAsync(o => o.TotalAmount);

            // Doanh thu tháng này
            var monthRevenue = await _context.Orders
                .Where(o => o.OrderDate >= firstDayOfMonth &&
                           o.OrderDate <= lastDayOfMonth &&
                           o.Status == "delivered")
                .SumAsync(o => o.TotalAmount);

            return new AdminStatisticsDto
            {
                TotalOrders = totalOrders,
                CompletedOrders = completedOrders,
                CancelledOrders = cancelledOrders,
                TodayRevenue = todayRevenue,
                MonthRevenue = monthRevenue
            };
        }

        public async Task<SellerStatisticsDto> GetSellerStatisticsAsync(Guid sellerId)
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

            // Lấy thông tin shop của seller
            var shop = await _context.Shops
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (shop == null)
                throw new Exception("Shop not found for this seller");

            // Tổng sản phẩm đang bán
            var totalProducts = await _context.Products
                .CountAsync(p => p.ShopId == shop.ShopId);

            // Tổng đơn hàng đã bán
            var totalOrdersSold = await _context.Orders
                .CountAsync(o => o.ShopId == shop.ShopId);

            // Doanh thu hôm nay
            var todayRevenue = await _context.Orders
                .Where(o => o.ShopId == shop.ShopId &&
                           o.OrderDate.Date == today &&
                           o.Status == "delivered")
                .SumAsync(o => o.TotalAmount);

            // Doanh thu tháng này
            var monthRevenue = await _context.Orders
                .Where(o => o.ShopId == shop.ShopId &&
                           o.OrderDate >= firstDayOfMonth &&
                           o.OrderDate <= lastDayOfMonth &&
                           o.Status == "delivered")
                .SumAsync(o => o.TotalAmount);

            return new SellerStatisticsDto
            {
                TotalProducts = totalProducts,
                TotalOrdersSold = totalOrdersSold,
                TodayRevenue = todayRevenue,
                MonthRevenue = monthRevenue
            };
        }
    }
}