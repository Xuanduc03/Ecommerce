using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EcommerceBe.Controllers
{
    // Updated Payment Controller để fix validation errors
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IVNPayService _vnPayService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IVNPayService vnPayService, ILogger<PaymentController> logger)
        {
            _vnPayService = vnPayService;
            _logger = logger;
        }

        // Option 1: Accept request wrapper
        [HttpPost("create-payment")]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentRequestWrapper wrapper)
        {
            try
            {
                var request = wrapper.Request;

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

                _logger.LogInformation($"Creating payment for order {request.OrderId}, amount: {request.Amount}");

                var result = await _vnPayService.CreatePaymentAsync(request);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // Option 2: Accept direct request (alternative endpoint)
        [HttpPost("create-payment-direct")]
        public async Task<ActionResult<PaymentResponseDto>> CreatePaymentDirect([FromBody] PaymentRequestDto request)
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

                _logger.LogInformation($"Creating payment for order {request.OrderId}, amount: {request.Amount}");

                var result = await _vnPayService.CreatePaymentAsync(request);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> PaymentCallback()
        {
            try
            {
                _logger.LogInformation("Payment callback received with query params: " + string.Join(", ", Request.Query.Select(q => $"{q.Key}={q.Value}")));

                if (!Request.Query.Any())
                {
                    _logger.LogWarning("No query parameters received in callback");
                    return Redirect("https://your-frontend-domain.com/payment-callback?error=no_params");
                }

                var callback = await _vnPayService.ProcessCallbackAsync(Request.Query);
                
                if (callback == null)
                {
                    _logger.LogError("Failed to process callback data");
                    return Redirect("https://your-frontend-domain.com/payment-callback?error=processing_failed");
                }

                var isValid = await _vnPayService.ValidateCallbackAsync(callback);

                if (isValid && callback.vnp_ResponseCode == "00")
                {
                    // Payment successful - update order status in database
                    _logger.LogInformation($"Payment successful for order {callback.vnp_TxnRef}");

                    // TODO: Update order status to "paid" in database
                    // Example:
                    // await _orderService.UpdateOrderStatusAsync(callback.vnp_TxnRef, "paid");

                    // Redirect to frontend success page with query params
                    return Redirect($"https://your-frontend-domain.com/payment-callback?vnp_ResponseCode={callback.vnp_ResponseCode}&vnp_TxnRef={callback.vnp_TxnRef}&vnp_TransactionStatus={callback.vnp_TransactionStatus}&status=success");
                }
                else
                {
                    // Payment failed
                    _logger.LogWarning($"Payment failed for order {callback.vnp_TxnRef}, Response Code: {callback.vnp_ResponseCode}, Valid: {isValid}");

                    // Redirect to frontend failure page
                    return Redirect($"https://your-frontend-domain.com/payment-callback?vnp_ResponseCode={callback.vnp_ResponseCode}&vnp_TxnRef={callback.vnp_TxnRef}&vnp_TransactionStatus={callback.vnp_TransactionStatus}&status=failed&valid={isValid}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment callback");
                return Redirect("https://your-frontend-domain.com/payment-callback?error=exception&message=" + Uri.EscapeDataString(ex.Message));
            }
        }

        [HttpPost("ipn")]
        public async Task<IActionResult> PaymentIPN()
        {
            try
            {
                _logger.LogInformation("IPN received with query params: " + string.Join(", ", Request.Query.Select(q => $"{q.Key}={q.Value}")));

                if (!Request.Query.Any())
                {
                    _logger.LogWarning("No query parameters received in IPN");
                    return Ok(new { RspCode = "99", Message = "No parameters" });
                }

                var callback = await _vnPayService.ProcessCallbackAsync(Request.Query);
                
                if (callback == null)
                {
                    _logger.LogError("Failed to process IPN data");
                    return Ok(new { RspCode = "99", Message = "Processing failed" });
                }

                var isValid = await _vnPayService.ValidateCallbackAsync(callback);

                if (isValid)
                {
                    if (callback.vnp_ResponseCode == "00" && callback.vnp_TransactionStatus == "00")
                    {
                        // Payment successful - update database
                        _logger.LogInformation($"IPN: Payment confirmed for order {callback.vnp_TxnRef}");

                        // TODO: Update order status to "paid" and send confirmation email
                        // await _orderService.UpdateOrderStatusAsync(callback.vnp_TxnRef, "paid");
                        // await _emailService.SendPaymentConfirmationAsync(callback.vnp_TxnRef);

                        return Ok(new { RspCode = "00", Message = "success" });
                    }
                    else
                    {
                        // Payment failed but signature is valid
                        _logger.LogWarning($"IPN: Payment failed for order {callback.vnp_TxnRef}, ResponseCode: {callback.vnp_ResponseCode}, TransactionStatus: {callback.vnp_TransactionStatus}");
                        return Ok(new { RspCode = "00", Message = "success" });
                    }
                }
                else
                {
                    // Invalid signature
                    _logger.LogError($"IPN: Invalid signature for order {callback.vnp_TxnRef}");
                    return Ok(new { RspCode = "97", Message = "Fail checksum" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing IPN");
                return Ok(new { RspCode = "99", Message = "Unknown error" });
            }
        }
    }
}