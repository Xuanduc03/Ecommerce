using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace EcommerceBe.Services
{
    public class MockPaymentService : IMockPaymentService
    {
        private readonly ILogger<MockPaymentService> _logger;
        private readonly Dictionary<string, MockPaymentStatusDto> _mockPayments = new();

        public MockPaymentService(ILogger<MockPaymentService> logger)
        {
            _logger = logger;
        }

        public async Task<PaymentResponseDto> CreateMockPaymentAsync(PaymentRequestDto request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    return new PaymentResponseDto
                    {
                        Success = false,
                        Message = "Amount must be greater than 0",
                        OrderId = request.OrderId
                    };
                }

                if (string.IsNullOrEmpty(request.OrderId))
                {
                    return new PaymentResponseDto
                    {
                        Success = false,
                        Message = "OrderId is required",
                        OrderId = request.OrderId
                    };
                }

                // Generate mock transaction ID
                var transactionId = GenerateMockTransactionId();
                
                // Create mock payment status
                var mockPayment = new MockPaymentStatusDto
                {
                    OrderId = request.OrderId,
                    TransactionId = transactionId,
                    Status = "pending",
                    Amount = request.Amount,
                    CreatedAt = DateTime.UtcNow,
                    OrderInfo = request.OrderInfo,
                    PaymentMethod = "mock"
                };

                // Store in memory (in production, this would be in database)
                _mockPayments[request.OrderId] = mockPayment;

                // Generate mock payment URL
                var paymentUrl = $"/mock-payment/{request.OrderId}?transactionId={transactionId}";

                _logger.LogInformation($"Mock payment created for order {request.OrderId}, transaction: {transactionId}");

                return new PaymentResponseDto
                {
                    Success = true,
                    PaymentUrl = paymentUrl,
                    Message = "Mock payment URL created successfully",
                    OrderId = request.OrderId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating mock payment for order {request.OrderId}");
                return new PaymentResponseDto
                {
                    Success = false,
                    Message = "Error creating mock payment",
                    OrderId = request.OrderId
                };
            }
        }

        public async Task<PaymentCallbackDto> ProcessMockCallbackAsync(string orderId, string status)
        {
            try
            {
                if (!_mockPayments.TryGetValue(orderId, out var mockPayment))
                {
                    throw new InvalidOperationException($"Mock payment not found for order {orderId}");
                }

                // Update payment status
                mockPayment.Status = status;
                mockPayment.CompletedAt = DateTime.UtcNow;

                // Create callback response similar to VNPay
                var callback = new PaymentCallbackDto
                {
                    vnp_Amount = ((long)(mockPayment.Amount * 100)).ToString(),
                    vnp_BankCode = "MOCK",
                    vnp_BankTranNo = mockPayment.TransactionId,
                    vnp_CardType = "ATM",
                    vnp_OrderInfo = mockPayment.OrderInfo,
                    vnp_PayDate = DateTime.UtcNow.ToString("yyyyMMddHHmmss"),
                    vnp_ResponseCode = status == "success" ? "00" : "99",
                    vnp_TmnCode = "MOCK",
                    vnp_TransactionNo = mockPayment.TransactionId,
                    vnp_TransactionStatus = status == "success" ? "00" : "99",
                    vnp_TxnRef = orderId,
                    vnp_SecureHash = GenerateMockSecureHash(orderId, status)
                };

                _logger.LogInformation($"Mock payment callback processed for order {orderId}, status: {status}");

                return callback;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing mock callback for order {orderId}");
                throw;
            }
        }

        public async Task<bool> ValidateMockPaymentAsync(string orderId, string transactionId)
        {
            try
            {
                if (!_mockPayments.TryGetValue(orderId, out var mockPayment))
                {
                    _logger.LogWarning($"Mock payment not found for order {orderId}");
                    return false;
                }

                if (mockPayment.TransactionId != transactionId)
                {
                    _logger.LogWarning($"Invalid transaction ID for order {orderId}");
                    return false;
                }

                if (mockPayment.Status != "success")
                {
                    _logger.LogWarning($"Mock payment not successful for order {orderId}, status: {mockPayment.Status}");
                    return false;
                }

                _logger.LogInformation($"Mock payment validated successfully for order {orderId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating mock payment for order {orderId}");
                return false;
            }
        }

        public async Task<MockPaymentStatusDto> GetMockPaymentStatusAsync(string orderId)
        {
            try
            {
                if (_mockPayments.TryGetValue(orderId, out var mockPayment))
                {
                    return mockPayment;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting mock payment status for order {orderId}");
                return null;
            }
        }

        private string GenerateMockTransactionId()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random();
            var randomPart = random.Next(100000, 999999).ToString();
            return $"MOCK{timestamp}{randomPart}";
        }

        private string GenerateMockSecureHash(string orderId, string status)
        {
            var data = $"orderId={orderId}&status={status}&timestamp={DateTime.UtcNow.Ticks}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToBase64String(hashBytes);
        }
    }
}