using EcommerceBe.Dto;
using EcommerceBe.Services;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace EcommerceBe
{
    public class VNPayTest
    {
        public static void TestVNPayService()
        {
            // Test configuration
            var config = new VNPayConfig
            {
                TmnCode = "2QXUI4J4",
                HashSecret = "SECRETKEYVNPAYTEST",
                BaseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                ReturnUrl = "https://localhost:7040/api/payment/callback",
                Version = "2.1.0",
                Command = "pay",
                CurrCode = "VND",
                Locale = "vn"
            };

            var options = Options.Create(config);
            var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<VNPayService>();
            var service = new VNPayService(options, logger);

            // Test payment request
            var request = new PaymentRequestDto
            {
                OrderId = "TEST_ORDER_001",
                Amount = 100000, // 100,000 VND
                OrderInfo = "Test payment for order TEST_ORDER_001",
                CustomerName = "Test Customer",
                CustomerEmail = "test@example.com",
                CustomerPhone = "0123456789"
            };

            try
            {
                var result = service.CreatePaymentAsync(request).Result;
                Console.WriteLine($"Payment URL: {result.PaymentUrl}");
                Console.WriteLine($"Success: {result.Success}");
                Console.WriteLine($"Message: {result.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
}