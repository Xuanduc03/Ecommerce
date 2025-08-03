using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/mock-payment")]
    public class MockPaymentController : ControllerBase
    {
        private readonly IMockPaymentService _mockPaymentService;
        private readonly ILogger<MockPaymentController> _logger;

        public MockPaymentController(IMockPaymentService mockPaymentService, ILogger<MockPaymentController> logger)
        {
            _mockPaymentService = mockPaymentService;
            _logger = logger;
        }

        [HttpPost("create")]
        public async Task<ActionResult<PaymentResponseDto>> CreateMockPayment([FromBody] PaymentRequestDto request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    return BadRequest(new { message = "Amount must be greater than 0" });
                }

                if (string.IsNullOrEmpty(request.OrderId))
                {
                    return BadRequest(new { message = "OrderId is required" });
                }

                _logger.LogInformation($"Creating mock payment for order {request.OrderId}, amount: {request.Amount}");

                var result = await _mockPaymentService.CreateMockPaymentAsync(request);

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

        [HttpGet("status/{orderId}")]
        public async Task<ActionResult<MockPaymentStatusDto>> GetPaymentStatus(string orderId)
        {
            try
            {
                var status = await _mockPaymentService.GetMockPaymentStatusAsync(orderId);
                
                if (status == null)
                {
                    return NotFound(new { message = "Payment not found" });
                }

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mock payment status");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("callback/{orderId}")]
        public async Task<ActionResult<PaymentCallbackDto>> ProcessMockCallback(string orderId, [FromQuery] string status = "success")
        {
            try
            {
                if (status != "success" && status != "failed")
                {
                    return BadRequest(new { message = "Status must be 'success' or 'failed'" });
                }

                _logger.LogInformation($"Processing mock callback for order {orderId}, status: {status}");

                var callback = await _mockPaymentService.ProcessMockCallbackAsync(orderId, status);

                return Ok(callback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing mock callback");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("validate/{orderId}")]
        public async Task<ActionResult> ValidateMockPayment(string orderId, [FromQuery] string transactionId)
        {
            try
            {
                if (string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest(new { message = "TransactionId is required" });
                }

                _logger.LogInformation($"Validating mock payment for order {orderId}, transaction: {transactionId}");

                var isValid = await _mockPaymentService.ValidateMockPaymentAsync(orderId, transactionId);

                if (isValid)
                {
                    return Ok(new { message = "Payment validated successfully", orderId, transactionId });
                }

                return BadRequest(new { message = "Payment validation failed", orderId, transactionId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating mock payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("simulate/{orderId}")]
        public async Task<ActionResult> SimulatePaymentPage(string orderId)
        {
            try
            {
                var status = await _mockPaymentService.GetMockPaymentStatusAsync(orderId);
                
                if (status == null)
                {
                    return NotFound(new { message = "Payment not found" });
                }

                // Return HTML page for payment simulation
                var html = $@"
<!DOCTYPE html>
<html>
<head>
    <title>Mock Payment - Order {orderId}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .payment-card {{ border: 1px solid #ddd; padding: 20px; border-radius: 8px; }}
        .amount {{ font-size: 24px; color: #2c3e50; margin: 20px 0; }}
        .button {{ background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin: 10px; }}
        .button.success {{ background: #27ae60; }}
        .button.failed {{ background: #e74c3c; }}
        .info {{ background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <h1>Mock Payment Gateway</h1>
        <div class='payment-card'>
            <h2>Order: {orderId}</h2>
            <div class='amount'>Amount: ${status.Amount:N2}</div>
            <div class='info'>
                <p><strong>Transaction ID:</strong> {status.TransactionId}</p>
                <p><strong>Status:</strong> {status.Status}</p>
                <p><strong>Created:</strong> {status.CreatedAt:yyyy-MM-dd HH:mm:ss}</p>
            </div>
            <div>
                <button class='button success' onclick='simulatePayment(""{orderId}"", ""success"")'>Simulate Success</button>
                <button class='button failed' onclick='simulatePayment(""{orderId}"", ""failed"")'>Simulate Failed</button>
            </div>
        </div>
    </div>
    <script>
        function simulatePayment(orderId, status) {{
            fetch(`/api/mock-payment/callback/${{orderId}}?status=${{status}}`, {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }}
            }})
            .then(response => response.json())
            .then(data => {{
                alert(`Payment ${{status}}! Transaction ID: ${{data.vnp_TransactionNo}}`);
                window.location.href = `/payment-callback?vnp_ResponseCode=${{data.vnp_ResponseCode}}&vnp_TxnRef=${{data.vnp_TxnRef}}&vnp_TransactionStatus=${{data.vnp_TransactionStatus}}`;
            }})
            .catch(error => {{
                console.error('Error:', error);
                alert('Error processing payment');
            }});
        }}
    </script>
</body>
</html>";

                return Content(html, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating mock payment page");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}