# VNPay Integration Debug Guide

## Các lỗi đã được sửa:

### 1. **Thiếu đăng ký Service và Config**
- ✅ Đã thêm VNPayConfig vào Program.cs
- ✅ Đã đăng ký IVNPayService trong DI container

### 2. **Cải thiện Error Handling**
- ✅ Thêm validation cho callback data
- ✅ Cải thiện logging chi tiết
- ✅ Xử lý null reference exceptions

### 3. **Sửa lỗi VnPayCompare**
- ✅ Đảm bảo sắp xếp parameters đúng theo yêu cầu VNPay

## Cách test và debug:

### 1. **Test tạo payment URL:**
```bash
curl -X POST "https://localhost:7040/api/payment/create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "request": {
      "orderId": "TEST_ORDER_001",
      "amount": 100000,
      "orderInfo": "Test payment",
      "customerName": "Test Customer",
      "customerEmail": "test@example.com",
      "customerPhone": "0123456789"
    }
  }'
```

### 2. **Test callback endpoint:**
```bash
curl "https://localhost:7040/api/payment/callback?vnp_Amount=10000000&vnp_BankCode=NCB&vnp_OrderInfo=Test&vnp_ResponseCode=00&vnp_TxnRef=TEST_ORDER_001&vnp_SecureHash=abc123"
```

### 3. **Kiểm tra logs:**
- Xem logs trong console hoặc file log
- Tìm các log messages bắt đầu với "Payment callback received"
- Kiểm tra "Invalid VNPay signature" warnings

## Các lỗi thường gặp và cách khắc phục:

### 1. **"Invalid signature" error:**
- Kiểm tra HashSecret trong appsettings.json
- Đảm bảo parameters được sắp xếp đúng thứ tự
- Kiểm tra encoding của parameters

### 2. **"No query parameters" error:**
- Đảm bảo VNPay gửi đúng callback URL
- Kiểm tra ReturnUrl configuration

### 3. **"Processing failed" error:**
- Kiểm tra PaymentCallbackDto properties
- Đảm bảo tất cả required fields có trong callback

## Configuration cần thiết:

### appsettings.json:
```json
{
  "VNPay": {
    "TmnCode": "YOUR_TMN_CODE",
    "HashSecret": "YOUR_HASH_SECRET",
    "BaseUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "ReturnUrl": "https://your-domain.com/api/payment/callback",
    "Version": "2.1.0",
    "Command": "pay",
    "CurrCode": "VND",
    "Locale": "vn"
  }
}
```

## Frontend Integration:

### 1. **Redirect to payment:**
```javascript
const response = await fetch('/api/payment/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request: {
      orderId: 'ORDER_001',
      amount: 100000,
      orderInfo: 'Payment for order ORDER_001'
    }
  })
});

const result = await response.json();
if (result.success) {
  window.location.href = result.paymentUrl;
}
```

### 2. **Handle callback:**
```javascript
// Trong component xử lý callback
const urlParams = new URLSearchParams(window.location.search);
const responseCode = urlParams.get('vnp_ResponseCode');
const orderId = urlParams.get('vnp_TxnRef');
const status = urlParams.get('status');

if (status === 'success') {
  // Payment successful
  console.log('Payment successful for order:', orderId);
} else {
  // Payment failed
  console.log('Payment failed for order:', orderId);
}
```

## Monitoring và Debugging:

### 1. **Enable detailed logging:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "EcommerceBe.Controllers.PaymentController": "Debug",
      "EcommerceBe.Services.VNPayService": "Debug"
    }
  }
}
```

### 2. **Check VNPay sandbox logs:**
- Đăng nhập vào VNPay sandbox
- Xem transaction logs
- Kiểm tra callback history

### 3. **Test với Postman:**
- Import collection cho VNPay endpoints
- Test với sample data
- Verify response format