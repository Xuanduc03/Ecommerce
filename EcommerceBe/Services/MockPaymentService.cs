using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using System.Collections.Concurrent;

namespace EcommerceBe.Services
{
    public class MockPaymentService : IMockPaymentService
    {
        private readonly ILogger<MockPaymentService> _logger;
        
        // In-memory storage for demo purposes - in real app, use database
        private static readonly ConcurrentDictionary<string, MockPaymentTransaction> _payments = new();
        
        public MockPaymentService(ILogger<MockPaymentService> logger)
        {
            _logger = logger;
        }

        public async Task<MockPaymentResponseDto> CreatePaymentAsync(MockPaymentRequestDto request)
        {
            try
            {
                var transactionId = GenerateTransactionId();
                var simulation = request.Simulation ?? new MockPaymentSimulation();
                
                var transaction = new MockPaymentTransaction
                {
                    TransactionId = transactionId,
                    OrderId = request.OrderId,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    CustomerName = request.CustomerName,
                    CustomerEmail = request.CustomerEmail,
                    CustomerPhone = request.CustomerPhone,
                    OrderInfo = request.OrderInfo,
                    Status = MockPaymentStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    Simulation = simulation
                };

                _payments[transactionId] = transaction;

                _logger.LogInformation($"Mock payment created: {transactionId} for order {request.OrderId}");

                // Simulate payment URL (in real scenario, this would redirect to payment gateway)
                var paymentUrl = $"/api/mockpayment/process/{transactionId}";

                return new MockPaymentResponseDto
                {
                    Success = true,
                    PaymentUrl = paymentUrl,
                    Message = "Payment initiated successfully",
                    OrderId = request.OrderId,
                    TransactionId = transactionId,
                    PaymentMethod = request.PaymentMethod,
                    Status = MockPaymentStatus.Pending,
                    ProcessedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mock payment");
                return new MockPaymentResponseDto
                {
                    Success = false,
                    Message = "Failed to create payment",
                    Status = MockPaymentStatus.Failed
                };
            }
        }

        public async Task<MockPaymentCallbackDto> ProcessPaymentAsync(string transactionId)
        {
            try
            {
                if (!_payments.TryGetValue(transactionId, out var transaction))
                {
                    _logger.LogWarning($"Transaction not found: {transactionId}");
                    return new MockPaymentCallbackDto
                    {
                        TransactionId = transactionId,
                        Status = MockPaymentStatus.Failed,
                        ResponseCode = "01",
                        Message = "Transaction not found"
                    };
                }

                // Update status to processing
                transaction.Status = MockPaymentStatus.Processing;
                transaction.ProcessingStartedAt = DateTime.UtcNow;

                _logger.LogInformation($"Processing mock payment: {transactionId}");

                // Simulate processing delay
                if (transaction.Simulation.DelaySeconds > 0)
                {
                    await Task.Delay(transaction.Simulation.DelaySeconds * 1000);
                }

                // Determine success or failure based on simulation
                MockPaymentStatus finalStatus;
                string responseCode;
                string message;

                if (transaction.Simulation.ShouldSucceed)
                {
                    finalStatus = MockPaymentStatus.Success;
                    responseCode = "00";
                    message = "Payment successful";
                    transaction.CompletedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation($"Mock payment successful: {transactionId}");
                }
                else
                {
                    finalStatus = MockPaymentStatus.Failed;
                    responseCode = "05"; // Generic failure code
                    message = transaction.Simulation.FailureReason ?? "Payment failed";
                    transaction.FailedAt = DateTime.UtcNow;
                    
                    _logger.LogWarning($"Mock payment failed: {transactionId} - {message}");
                }

                // Update transaction status
                transaction.Status = finalStatus;
                transaction.ResponseCode = responseCode;
                transaction.Message = message;

                return new MockPaymentCallbackDto
                {
                    OrderId = transaction.OrderId,
                    TransactionId = transactionId,
                    Amount = transaction.Amount,
                    PaymentMethod = transaction.PaymentMethod,
                    Status = finalStatus,
                    ResponseCode = responseCode,
                    Message = message,
                    PaymentDate = DateTime.UtcNow,
                    BankCode = transaction.Simulation.BankCode,
                    BankTransactionRef = transaction.Simulation.TransactionRef ?? $"MOCK_{transactionId}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing mock payment: {transactionId}");
                return new MockPaymentCallbackDto
                {
                    TransactionId = transactionId,
                    Status = MockPaymentStatus.Failed,
                    ResponseCode = "99",
                    Message = "System error during payment processing"
                };
            }
        }

        public async Task<MockPaymentStatusDto> GetPaymentStatusAsync(string orderId)
        {
            var transaction = _payments.Values.FirstOrDefault(p => p.OrderId == orderId);
            
            if (transaction == null)
            {
                return new MockPaymentStatusDto
                {
                    OrderId = orderId,
                    Status = MockPaymentStatus.Failed,
                    Message = "Payment not found",
                    LastUpdated = DateTime.UtcNow
                };
            }

            return new MockPaymentStatusDto
            {
                OrderId = transaction.OrderId,
                TransactionId = transaction.TransactionId,
                Status = transaction.Status,
                Message = transaction.Message ?? GetStatusMessage(transaction.Status),
                LastUpdated = transaction.LastUpdatedAt
            };
        }

        public async Task<MockPaymentVerificationDto> VerifyPaymentAsync(string transactionId)
        {
            if (!_payments.TryGetValue(transactionId, out var transaction))
            {
                return new MockPaymentVerificationDto
                {
                    TransactionId = transactionId,
                    IsValid = false,
                    Status = MockPaymentStatus.Failed,
                    Message = "Transaction not found"
                };
            }

            return new MockPaymentVerificationDto
            {
                OrderId = transaction.OrderId,
                TransactionId = transactionId,
                IsValid = true,
                Status = transaction.Status,
                Message = transaction.Message ?? GetStatusMessage(transaction.Status)
            };
        }

        public async Task<bool> CancelPaymentAsync(string transactionId)
        {
            if (!_payments.TryGetValue(transactionId, out var transaction))
            {
                return false;
            }

            if (transaction.Status == MockPaymentStatus.Success)
            {
                _logger.LogWarning($"Cannot cancel completed payment: {transactionId}");
                return false;
            }

            transaction.Status = MockPaymentStatus.Cancelled;
            transaction.Message = "Payment cancelled";
            transaction.LastUpdatedAt = DateTime.UtcNow;

            _logger.LogInformation($"Mock payment cancelled: {transactionId}");
            return true;
        }

        public async Task<List<MockPaymentStatusDto>> GetAllPaymentsAsync()
        {
            return _payments.Values.Select(t => new MockPaymentStatusDto
            {
                OrderId = t.OrderId,
                TransactionId = t.TransactionId,
                Status = t.Status,
                Message = t.Message ?? GetStatusMessage(t.Status),
                LastUpdated = t.LastUpdatedAt
            }).ToList();
        }

        public string GenerateTransactionId()
        {
            return $"MOCK_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        private string GetStatusMessage(MockPaymentStatus status)
        {
            return status switch
            {
                MockPaymentStatus.Pending => "Payment is pending",
                MockPaymentStatus.Processing => "Payment is being processed",
                MockPaymentStatus.Success => "Payment completed successfully",
                MockPaymentStatus.Failed => "Payment failed",
                MockPaymentStatus.Cancelled => "Payment was cancelled",
                MockPaymentStatus.Expired => "Payment has expired",
                _ => "Unknown status"
            };
        }
    }

    // Internal class to store payment transaction data
    internal class MockPaymentTransaction
    {
        public string TransactionId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string OrderInfo { get; set; } = string.Empty;
        public MockPaymentStatus Status { get; set; }
        public string? Message { get; set; }
        public string? ResponseCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessingStartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? FailedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
        public MockPaymentSimulation Simulation { get; set; } = new();
    }
}