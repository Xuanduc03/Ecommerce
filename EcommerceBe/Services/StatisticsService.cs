using EcommerceBe.Dto;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IShopRepository _shopRepository;

        public StatisticsService(
            IOrderRepository orderRepository,
            IProductRepository productRepository,
            IShopRepository shopRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _shopRepository = shopRepository;
        }

        public async Task<AdminStatisticsDto> GetAdminStatisticsAsync()
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var allOrders = await _orderRepository.GetAllOrderAsync();
            
            var totalOrders = allOrders.Count();
            var completedOrders = allOrders.Count(o => o.Status == "Delivered");
            var cancelledOrders = allOrders.Count(o => o.Status == "Cancelled");
            
            var todayRevenue = allOrders
                .Where(o => o.CreatedAt.Date == today && o.Status != "Cancelled")
                .Sum(o => o.TotalAmount);
                
            var monthlyRevenue = allOrders
                .Where(o => o.CreatedAt >= startOfMonth && o.Status != "Cancelled")
                .Sum(o => o.TotalAmount);

            return new AdminStatisticsDto
            {
                TotalOrders = totalOrders,
                CompletedOrders = completedOrders,
                CancelledOrders = cancelledOrders,
                TodayRevenue = todayRevenue,
                MonthlyRevenue = monthlyRevenue
            };
        }

        public async Task<SellerStatisticsDto> GetSellerStatisticsAsync(Guid sellerId)
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // Lấy shop của seller
            var shop = await _shopRepository.GetShopBySellerIdAsync(sellerId);
            if (shop == null)
                throw new Exception("Shop not found for this seller");

            var shopId = shop.ShopId;

            // Lấy tất cả sản phẩm của shop
            var totalProducts = await _productRepository.GetProductsByShopIdAsync(shopId);
            var totalProductsCount = totalProducts.Count();

            // Lấy đơn hàng của shop
            var shopOrders = await _orderRepository.GetOrdersByShopIdAsync(shopId);
            var totalSoldOrders = shopOrders.Count(o => o.Status == "Delivered");

            // Tính doanh thu hôm nay
            var todayRevenue = shopOrders
                .Where(o => o.CreatedAt.Date == today && o.Status != "Cancelled")
                .Sum(o => o.TotalAmount);

            // Tính doanh thu tháng
            var monthlyRevenue = shopOrders
                .Where(o => o.CreatedAt >= startOfMonth && o.Status != "Cancelled")
                .Sum(o => o.TotalAmount);

            return new SellerStatisticsDto
            {
                TotalProducts = totalProductsCount,
                TotalSoldOrders = totalSoldOrders,
                TodayRevenue = todayRevenue,
                MonthlyRevenue = monthlyRevenue
            };
        }
    }
}