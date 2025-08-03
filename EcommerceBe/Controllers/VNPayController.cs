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
        private readonly IConfiguration _configuration;

        public PaymentController(IVNPayService vnPayService, ILogger<PaymentController> logger, IConfiguration configuration)
        {
            _vnPayService = vnPayService;
            _logger = logger;
            _configuration = configuration;
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
                var callback = await _vnPayService.ProcessCallbackAsync(Request.Query);
                var isValid = await _vnPayService.ValidateCallbackAsync(callback);

                // ✅ FIX: Lấy frontend URL từ configuration
                var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

                if (isValid)
                {
                    if (callback.vnp_ResponseCode == "00")
                    {
                        // Payment successful - update order status in database
                        _logger.LogInformation($"Payment successful for order {callback.vnp_TxnRef}");

                        // TODO: Update order status to "paid" in database
                        // Example:
                        // await _orderService.UpdateOrderStatusAsync(callback.vnp_TxnRef, "paid");

                        // Redirect to frontend success page
                        return Redirect($"{frontendUrl}/payment-callback?status=success&vnp_ResponseCode={callback.vnp_ResponseCode}&vnp_TxnRef={callback.vnp_TxnRef}&vnp_TransactionStatus={callback.vnp_TransactionStatus}");
                    }
                    else
                    {
                        // Payment failed but signature is valid
                        var errorMessage = _vnPayService.GetResponseCodeMeaning(callback.vnp_ResponseCode);
                        _logger.LogWarning($"Payment failed for order {callback.vnp_TxnRef}, Response Code: {callback.vnp_ResponseCode} - {errorMessage}");

                        // Redirect to frontend failure page
                        return Redirect($"{frontendUrl}/payment-callback?status=failed&vnp_ResponseCode={callback.vnp_ResponseCode}&vnp_TxnRef={callback.vnp_TxnRef}&vnp_TransactionStatus={callback.vnp_TransactionStatus}&error_message={Uri.EscapeDataString(errorMessage)}");
                    }
                }
                else
                {
                    // Invalid signature
                    _logger.LogError($"Invalid signature for order {callback.vnp_TxnRef}");
                    return Redirect($"{frontendUrl}/payment-callback?status=error&error=invalid_signature");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment callback");
                return Redirect($"{_configuration["Frontend:BaseUrl"] ?? "http://localhost:5173"}/payment-callback?status=error&error=system_error");
            }
        }

        [HttpPost("ipn")]
        public async Task<IActionResult> PaymentIPN()
        {
            try
            {
                // Kiểm tra cả hai trường hợp
                PaymentCallbackDto callback;

                if (Request.HasFormContentType && Request.Form.Count > 0)
                {
                    // Đọc từ form data
                    var formParams = Request.Form.Select(x => new KeyValuePair<string, Microsoft.Extensions.Primitives.StringValues>(x.Key, x.Value));
                    var queryCollection = new Microsoft.AspNetCore.Http.QueryCollection(formParams.ToDictionary(x => x.Key, x => x.Value));
                    callback = await _vnPayService.ProcessCallbackAsync(queryCollection);
                }
                else
                {
                    // Đọc từ query string (như trước)
                    callback = await _vnPayService.ProcessCallbackAsync(Request.Query);
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