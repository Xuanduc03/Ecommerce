using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace EcommerceBe.Services
{
    public class VNPayService : IVNPayService
    {
        private readonly VNPayConfig _config;
        private readonly ILogger<VNPayService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public VNPayService(IOptions<VNPayConfig> config, ILogger<VNPayService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _config = config.Value;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request)
        {
            try
            {
                var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);

                var vnpay = new VnPayLibrary();

                // Add parameters in correct order and format
                vnpay.AddRequestData("vnp_Version", _config.Version);
                vnpay.AddRequestData("vnp_Command", _config.Command);
                vnpay.AddRequestData("vnp_TmnCode", _config.TmnCode);
                vnpay.AddRequestData("vnp_Amount", ((long)(request.Amount * 100)).ToString());
                vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
                vnpay.AddRequestData("vnp_CurrCode", _config.CurrCode);
                vnpay.AddRequestData("vnp_IpAddr", GetIpAddress());
                vnpay.AddRequestData("vnp_Locale", _config.Locale);
                vnpay.AddRequestData("vnp_OrderInfo", request.OrderInfo);
                vnpay.AddRequestData("vnp_OrderType", "other");
                vnpay.AddRequestData("vnp_ReturnUrl", _config.ReturnUrl);
                vnpay.AddRequestData("vnp_TxnRef", request.OrderId);

                var paymentUrl = vnpay.CreateRequestUrl(_config.BaseUrl, _config.HashSecret);

                _logger.LogInformation($"VNPay payment URL created for order {request.OrderId}");
                _logger.LogDebug($"Payment URL: {paymentUrl}");

                return new PaymentResponseDto
                {
                    Success = true,
                    PaymentUrl = paymentUrl,
                    Message = "Payment URL created successfully",
                    OrderId = request.OrderId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating VNPay payment for order {request.OrderId}");
                return new PaymentResponseDto
                {
                    Success = false,
                    Message = "Error creating payment URL",
                    OrderId = request.OrderId
                };
            }
        }

        public async Task<PaymentCallbackDto> ProcessCallbackAsync(IQueryCollection queryParams)
        {
            var callback = new PaymentCallbackDto();

            // Process all query parameters
            foreach (var param in queryParams)
            {
                var property = typeof(PaymentCallbackDto).GetProperty(param.Key);
                if (property != null && property.CanWrite)
                {
                    property.SetValue(callback, param.Value.ToString());
                }
            }

            _logger.LogInformation($"Processing VNPay callback for order {callback.vnp_TxnRef}: ResponseCode={callback.vnp_ResponseCode}, TransactionStatus={callback.vnp_TransactionStatus}, Amount={callback.vnp_Amount}");

            return callback;
        }

        public string GetResponseCodeMeaning(string responseCode)
        {
            return responseCode switch
            {
                "00" => "Giao dịch thành công",
                "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
                "09" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
                "10" => "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
                "11" => "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
                "12" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
                "13" => "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
                "24" => "Giao dịch không thành công do: Khách hàng hủy giao dịch",
                "51" => "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
                "65" => "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
                "75" => "Ngân hàng thanh toán đang bảo trì.",
                "79" => "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
                "99" => "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
                _ => $"Mã lỗi không xác định: {responseCode}"
            };
        }

        public async Task<bool> ValidateCallbackAsync(PaymentCallbackDto callback)
        {
            try
            {
                var vnpay = new VnPayLibrary();

                // Add all parameters except vnp_SecureHash for validation
                var properties = typeof(PaymentCallbackDto).GetProperties()
                    .Where(p => p.Name != "vnp_SecureHash" && p.Name != "vnp_SecureHashType")
                    .OrderBy(p => p.Name);

                foreach (var prop in properties)
                {
                    var value = prop.GetValue(callback)?.ToString();
                    if (!string.IsNullOrEmpty(value))
                    {
                        vnpay.AddResponseData(prop.Name, value);
                    }
                }

                var isValidSignature = vnpay.ValidateSignature(callback.vnp_SecureHash, _config.HashSecret);

                if (!isValidSignature)
                {
                    _logger.LogWarning($"Invalid VNPay signature for transaction {callback.vnp_TxnRef}");
                    _logger.LogDebug($"Expected hash vs received hash validation failed for order {callback.vnp_TxnRef}");
                    return false;
                }

                _logger.LogInformation($"VNPay callback signature validated successfully for order {callback.vnp_TxnRef} with response code {callback.vnp_ResponseCode}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating VNPay callback for order {callback.vnp_TxnRef}");
                return false;
            }
        }

        private string GetIpAddress()
        {
            try
            {
                var context = _httpContextAccessor.HttpContext;
                if (context != null)
                {
                    var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                    if (string.IsNullOrEmpty(ipAddress))
                    {
                        ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
                    }
                    if (string.IsNullOrEmpty(ipAddress))
                    {
                        ipAddress = context.Connection.RemoteIpAddress?.ToString();
                    }

                    return !string.IsNullOrEmpty(ipAddress) ? ipAddress : "127.0.0.1";
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting IP address, using default");
            }

            return "127.0.0.1";
        }
    }

    // Fixed VNPay Library Helper Class
    public class VnPayLibrary
    {
        private readonly SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());
        private readonly SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public void AddResponseData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _responseData.Add(key, value);
            }
        }

        public string GetResponseData(string key)
        {
            return _responseData.TryGetValue(key, out string? retValue) ? retValue : string.Empty;
        }

        public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
        {
            // 1. rawData: dùng để ký → KHÔNG encode value
            var rawData = new StringBuilder();
            foreach (var kv in _requestData)
            {
                if (rawData.Length > 0)
                    rawData.Append('&');

                rawData.Append($"{kv.Key}={kv.Value}"); // ❗ Không encode - ĐÚNG RỒI
            }

            // 2. queryData: dùng trong URL → PHẢI encode
            var queryData = new StringBuilder();
            foreach (var kv in _requestData)
            {
                if (queryData.Length > 0)
                    queryData.Append('&');

                queryData.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
            }

            // 3. Ký bằng rawData (không encode)
            var vnpSecureHash = HmacSHA512(vnpHashSecret, rawData.ToString());

            // 4. Trả về URL đầy đủ
            var paymentUrl = $"{baseUrl}?{queryData}&vnp_SecureHash={vnpSecureHash}";

            // Debug logging để kiểm tra
            System.Diagnostics.Debug.WriteLine($"Raw data for signing: {rawData}");
            System.Diagnostics.Debug.WriteLine($"Generated hash: {vnpSecureHash}");

            return paymentUrl;
        }

        public bool ValidateSignature(string inputHash, string secretKey)
        {
            var rspRaw = GetResponseData();
            var myChecksum = HmacSHA512(secretKey, rspRaw);
            return myChecksum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string GetResponseData()
        {
            var data = new StringBuilder();

            // Remove secure hash related fields
            if (_responseData.ContainsKey("vnp_SecureHashType"))
            {
                _responseData.Remove("vnp_SecureHashType");
            }
            if (_responseData.ContainsKey("vnp_SecureHash"))
            {
                _responseData.Remove("vnp_SecureHash");
            }

            foreach (var kv in _responseData)
            {
                if (data.Length > 0)
                {
                    data.Append('&');
                }
                // ❗ QUAN TRỌNG: Không encode khi validate chữ ký
                // VNPay yêu cầu raw data cho việc validate signature
                data.Append($"{kv.Key}={kv.Value}");
            }

            // Debug logging
            System.Diagnostics.Debug.WriteLine($"Response data for validation: {data}");

            return data.ToString();
        }

        private static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }
    }

    public class VnPayCompare : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            return StringComparer.Ordinal.Compare(x, y);
        }
    }
}