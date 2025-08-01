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

        public VNPayService(IOptions<VNPayConfig> config, ILogger<VNPayService> logger)
        {
            _config = config.Value;
            _logger = logger;
        }

        public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request)
        {
            try
            {
                var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
                var tick = DateTime.Now.Ticks.ToString();

                var vnpay = new VnPayLibrary();

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

            foreach (var param in queryParams)
            {
                var property = typeof(PaymentCallbackDto).GetProperty(param.Key);
                if (property != null)
                {
                    property.SetValue(callback, param.Value.ToString());
                }
            }

            return callback;
        }

        public async Task<bool> ValidateCallbackAsync(PaymentCallbackDto callback)
        {
            try
            {
                var vnpay = new VnPayLibrary();

                // Add all parameters except vnp_SecureHash
                foreach (var prop in typeof(PaymentCallbackDto).GetProperties())
                {
                    if (prop.Name != "vnp_SecureHash")
                    {
                        var value = prop.GetValue(callback)?.ToString();
                        if (!string.IsNullOrEmpty(value))
                        {
                            vnpay.AddResponseData(prop.Name, value);
                        }
                    }
                }

                var isValidSignature = vnpay.ValidateSignature(callback.vnp_SecureHash, _config.HashSecret);

                if (!isValidSignature)
                {
                    _logger.LogWarning($"Invalid VNPay signature for transaction {callback.vnp_TxnRef}");
                    return false;
                }

                // Check response code
                if (callback.vnp_ResponseCode != "00")
                {
                    _logger.LogWarning($"VNPay transaction failed with code {callback.vnp_ResponseCode} for order {callback.vnp_TxnRef}");
                    return false;
                }

                _logger.LogInformation($"VNPay callback validated successfully for order {callback.vnp_TxnRef}");
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
            return "127.0.0.1"; // In production, get actual client IP
        }
    }

    // 4. VNPay Library Helper Class
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
            var data = new StringBuilder();
            foreach (var kv in _requestData)
            {
                if (data.Length > 0)
                {
                    data.Append('&');
                }
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
            }

            var queryString = data.ToString();
            var signData = queryString;
            var vnpSecureHash = HmacSHA512(vnpHashSecret, signData);
            var paymentUrl = baseUrl + "?" + queryString + "&vnp_SecureHash=" + vnpSecureHash;

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
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value));
            }
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

            // Đơn giản cho môi trường dev
            return StringComparer.Ordinal.Compare(x, y);
        }
    }

}
