using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MockPaymentController : ControllerBase
    {
        private readonly IMockPaymentService _mockPaymentService;
        private readonly ILogger<MockPaymentController> _logger;

        public MockPaymentController(IMockPaymentService mockPaymentService, ILogger<MockPaymentController> logger)
        {
            _mockPaymentService = mockPaymentService;
            _logger = logger;
        }

        /// <summary>
        /// Create a mock payment simulation
        /// </summary>
        [HttpPost("create")]
        public async Task<ActionResult<MockPaymentResponseDto>> CreatePayment([FromBody] MockPaymentRequestDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Request data is required" });
                }

                if (request.Amount <= 0)
                {
                    return BadRequest(new { message = "Amount must be greater than 0" });
                }

                if (string.IsNullOrEmpty(request.OrderId))
                {
                    return BadRequest(new { message = "OrderId is required" });
                }

                _logger.LogInformation($"Creating mock payment for order {request.OrderId}, amount: {request.Amount}");

                var result = await _mockPaymentService.CreatePaymentAsync(request);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mock payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Process a mock payment (simulate payment gateway processing)
        /// </summary>
        [HttpPost("process/{transactionId}")]
        public async Task<ActionResult<MockPaymentCallbackDto>> ProcessPayment(string transactionId)
        {
            try
            {
                if (string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest(new { message = "Transaction ID is required" });
                }

                _logger.LogInformation($"Processing mock payment: {transactionId}");

                var result = await _mockPaymentService.ProcessPaymentAsync(transactionId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing mock payment: {transactionId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get payment status by order ID
        /// </summary>
        [HttpGet("status/{orderId}")]
        public async Task<ActionResult<MockPaymentStatusDto>> GetPaymentStatus(string orderId)
        {
            try
            {
                if (string.IsNullOrEmpty(orderId))
                {
                    return BadRequest(new { message = "Order ID is required" });
                }

                var result = await _mockPaymentService.GetPaymentStatusAsync(orderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting payment status for order: {orderId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Verify a payment by transaction ID
        /// </summary>
        [HttpGet("verify/{transactionId}")]
        public async Task<ActionResult<MockPaymentVerificationDto>> VerifyPayment(string transactionId)
        {
            try
            {
                if (string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest(new { message = "Transaction ID is required" });
                }

                var result = await _mockPaymentService.VerifyPaymentAsync(transactionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying payment: {transactionId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Cancel a pending payment
        /// </summary>
        [HttpPost("cancel/{transactionId}")]
        public async Task<ActionResult> CancelPayment(string transactionId)
        {
            try
            {
                if (string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest(new { message = "Transaction ID is required" });
                }

                var result = await _mockPaymentService.CancelPaymentAsync(transactionId);

                if (result)
                {
                    return Ok(new { message = "Payment cancelled successfully" });
                }

                return BadRequest(new { message = "Failed to cancel payment or payment already completed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling payment: {transactionId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get all payments (for admin/testing purposes)
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<List<MockPaymentStatusDto>>> GetAllPayments()
        {
            try
            {
                var result = await _mockPaymentService.GetAllPaymentsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all payments");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Generate a new transaction ID
        /// </summary>
        [HttpGet("generate-transaction-id")]
        public ActionResult<string> GenerateTransactionId()
        {
            try
            {
                var transactionId = _mockPaymentService.GenerateTransactionId();
                return Ok(new { transactionId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating transaction ID");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Simulate payment callback (for testing frontend integration)
        /// </summary>
        [HttpGet("simulate-callback")]
        public async Task<IActionResult> SimulateCallback(
            [FromQuery] string orderId,
            [FromQuery] string transactionId,
            [FromQuery] bool success = true,
            [FromQuery] string? returnUrl = null)
        {
            try
            {
                if (string.IsNullOrEmpty(orderId) || string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest(new { message = "OrderId and TransactionId are required" });
                }

                var callback = new MockPaymentCallbackDto
                {
                    OrderId = orderId,
                    TransactionId = transactionId,
                    Status = success ? MockPaymentStatus.Success : MockPaymentStatus.Failed,
                    ResponseCode = success ? "00" : "05",
                    Message = success ? "Payment successful" : "Payment failed",
                    PaymentDate = DateTime.UtcNow
                };

                // In a real scenario, this would redirect to the frontend with query parameters
                if (!string.IsNullOrEmpty(returnUrl))
                {
                    var redirectUrl = $"{returnUrl}?orderId={orderId}&transactionId={transactionId}&status={callback.Status}&responseCode={callback.ResponseCode}";
                    return Redirect(redirectUrl);
                }

                return Ok(callback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error simulating payment callback");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create a quick test payment with predefined scenarios
        /// </summary>
        [HttpPost("quick-test")]
        public async Task<ActionResult<MockPaymentResponseDto>> CreateQuickTestPayment([FromQuery] string scenario = "success")
        {
            try
            {
                var orderId = $"TEST_ORDER_{DateTime.UtcNow:yyyyMMddHHmmss}";
                
                var simulation = scenario.ToLower() switch
                {
                    "failure" => new MockPaymentSimulation
                    {
                        ShouldSucceed = false,
                        DelaySeconds = 1,
                        FailureReason = "Insufficient funds",
                        BankCode = "MOCK_BANK"
                    },
                    "slow" => new MockPaymentSimulation
                    {
                        ShouldSucceed = true,
                        DelaySeconds = 5,
                        BankCode = "SLOW_BANK"
                    },
                    "instant" => new MockPaymentSimulation
                    {
                        ShouldSucceed = true,
                        DelaySeconds = 0,
                        BankCode = "INSTANT_BANK"
                    },
                    _ => new MockPaymentSimulation
                    {
                        ShouldSucceed = true,
                        DelaySeconds = 2,
                        BankCode = "MOCK_BANK"
                    }
                };

                var request = new MockPaymentRequestDto
                {
                    OrderId = orderId,
                    Amount = 100000, // 100,000 VND
                    OrderInfo = $"Test payment - {scenario} scenario",
                    CustomerName = "Test Customer",
                    CustomerEmail = "test@example.com",
                    CustomerPhone = "0123456789",
                    PaymentMethod = "MOCK",
                    Simulation = simulation
                };

                var result = await _mockPaymentService.CreatePaymentAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quick test payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}