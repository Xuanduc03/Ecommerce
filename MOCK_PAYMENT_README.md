# Mock Payment System - Hệ Thống Thanh Toán Giả Lập

## Tổng quan

Chức năng Mock Payment System cho phép bạn mô phỏng các giao dịch thanh toán mà không cần kết nối với các cổng thanh toán thực tế. Hệ thống này hữu ích cho:

- **Testing & Development**: Test luồng thanh toán trong môi trường phát triển
- **Demo**: Trình diễn tính năng thanh toán cho khách hàng
- **Integration Testing**: Kiểm tra tích hợp với các hệ thống khác
- **Load Testing**: Kiểm tra hiệu suất hệ thống với nhiều giao dịch

## Tính năng chính

### 🎭 **Mô phỏng kịch bản đa dạng**
- ✅ Thanh toán thành công (nhanh/chậm/bình thường)
- ❌ Thanh toán thất bại (thiếu tiền, thẻ hết hạn, v.v.)
- ⏱️ Thời gian xử lý có thể tùy chỉnh (0-10 giây)
- 🏦 Mô phỏng các ngân hàng khác nhau

### 💳 **Hỗ trợ nhiều phương thức thanh toán**
- Mock Payment (mặc định)
- Credit Card
- Bank Transfer  
- Digital Wallet

### 📊 **Dashboard quản lý**
- Xem tất cả giao dịch
- Lọc theo trạng thái
- Tìm kiếm theo Order ID / Transaction ID
- Thống kê thành công/thất bại
- Hủy giao dịch đang chờ

## Cấu trúc dự án

```
EcommerceBe/
├── Controllers/
│   └── MockPaymentController.cs          # API endpoints
├── Services/
│   ├── MockPaymentService.cs             # Business logic
│   └── Interfaces/
│       └── IMockPaymentService.cs        # Service interface
├── Dto/
│   └── MockPaymentDto.cs                 # Data transfer objects
└── Models/
    └── Payment.cs                        # Payment model (existing)

fontend/src/
├── components/Payment/
│   ├── MockPayment.tsx                   # Payment form component
│   └── MockPaymentDashboard.tsx          # Dashboard component
├── pages/MockPaymentPage/
│   └── MockPaymentPage.tsx               # Main page
├── types/
│   └── payment.ts                        # TypeScript types
└── utils/
    └── mockPaymentApi.ts                 # API service
```

## API Endpoints

### 🔗 **Base URL**: `https://localhost:7040/api/mockpayment`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create` | Tạo giao dịch thanh toán mới |
| `POST` | `/process/{transactionId}` | Xử lý giao dịch |
| `GET` | `/status/{orderId}` | Lấy trạng thái thanh toán |
| `GET` | `/verify/{transactionId}` | Xác minh giao dịch |
| `POST` | `/cancel/{transactionId}` | Hủy giao dịch |
| `GET` | `/all` | Lấy tất cả giao dịch |
| `POST` | `/quick-test?scenario=success` | Tạo test nhanh |

### 📝 **Request Body Example**

```json
{
  "orderId": "ORDER_123456",
  "amount": 100000,
  "orderInfo": "Payment for order 123456",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0123456789",
  "paymentMethod": "MOCK",
  "simulation": {
    "shouldSucceed": true,
    "delaySeconds": 2,
    "failureReason": "Insufficient funds",
    "bankCode": "MOCK_BANK"
  }
}
```

### 📤 **Response Example**

```json
{
  "success": true,
  "paymentUrl": "/api/mockpayment/process/MOCK_20241210123045_A1B2C3D4",
  "message": "Payment initiated successfully",
  "orderId": "ORDER_123456",
  "transactionId": "MOCK_20241210123045_A1B2C3D4",
  "paymentMethod": "MOCK",
  "status": 0,
  "processedAt": "2024-12-10T12:30:45.123Z"
}
```

## Trạng thái thanh toán

| Status | Code | Màu sắc | Mô tả |
|--------|------|---------|--------|
| **Pending** | 0 | 🟡 Vàng | Chờ xử lý |
| **Processing** | 1 | 🔵 Xanh | Đang xử lý |
| **Success** | 2 | 🟢 Xanh lá | Thành công |
| **Failed** | 3 | 🔴 Đỏ | Thất bại |
| **Cancelled** | 4 | ⚫ Xám | Đã hủy |
| **Expired** | 5 | 🟠 Cam | Hết hạn |

## Response Codes

| Code | Ý nghĩa |
|------|---------|
| `00` | Thành công |
| `01` | Không tìm thấy giao dịch |
| `05` | Thanh toán thất bại |
| `97` | Chữ ký không hợp lệ |
| `99` | Lỗi hệ thống |

## Cách sử dụng

### 1. **Từ Frontend UI**

Truy cập trang Mock Payment:
```
http://localhost:5173/mock-payment
```

**Các tab có sẵn:**
- **Payment Simulation**: Tạo và test thanh toán
- **Payment Dashboard**: Xem tất cả giao dịch
- **API Information**: Tài liệu API

### 2. **Quick Test Scenarios**

Trong UI có sẵn các kịch bản test nhanh:

```typescript
// Success - Normal (2 giây)
// Success - Instant (ngay lập tức)  
// Success - Slow (5 giây)
// Failure - Insufficient Funds
// Failure - Card Expired
```

### 3. **Programmatic Usage**

```typescript
import { mockPaymentAPI } from '../utils/mockPaymentApi';

// Tạo thanh toán thành công
const successPayment = await mockPaymentAPI.createQuickTestPayment('success');

// Tạo thanh toán thất bại
const failedPayment = await mockPaymentAPI.createQuickTestPayment('failure');

// Tạo thanh toán tùy chỉnh
const customPayment = await mockPaymentAPI.createPayment({
  orderId: 'ORDER_123',
  amount: 50000,
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '0123456789',
  orderInfo: 'Test payment',
  paymentMethod: 'CREDIT_CARD',
  simulation: {
    shouldSucceed: false,
    delaySeconds: 3,
    failureReason: 'Card declined',
    bankCode: 'TEST_BANK'
  }
});
```

### 4. **cURL Examples**

```bash
# Tạo thanh toán mới
curl -X POST "https://localhost:7040/api/mockpayment/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_123456",
    "amount": 100000,
    "orderInfo": "Test payment",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "0123456789",
    "paymentMethod": "MOCK",
    "simulation": {
      "shouldSucceed": true,
      "delaySeconds": 2,
      "bankCode": "MOCK_BANK"
    }
  }'

# Test nhanh
curl -X POST "https://localhost:7040/api/mockpayment/quick-test?scenario=success" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy tất cả thanh toán
curl -X GET "https://localhost:7040/api/mockpayment/all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration

### Backend (C#)

Service được tự động đăng ký qua convention trong `Program.cs`. Không cần cấu hình thêm.

### Frontend (React/TypeScript)

Cập nhật API base URL trong `mockPaymentApi.ts` nếu cần:

```typescript
const API_BASE_URL = 'https://localhost:7040/api'; // Thay đổi nếu cần
```

## Testing Strategy

### 1. **Unit Testing**

```csharp
[Test]
public async Task CreatePayment_ShouldReturnSuccess()
{
    var request = new MockPaymentRequestDto
    {
        OrderId = "TEST_ORDER",
        Amount = 100000,
        CustomerName = "Test User",
        // ...
    };
    
    var result = await _mockPaymentService.CreatePaymentAsync(request);
    
    Assert.IsTrue(result.Success);
    Assert.IsNotNull(result.TransactionId);
}
```

### 2. **Integration Testing**

```typescript
describe('Mock Payment Integration', () => {
  it('should create and process payment successfully', async () => {
    const payment = await mockPaymentAPI.createQuickTestPayment('success');
    expect(payment.success).toBe(true);
    
    const result = await mockPaymentAPI.processPayment(payment.transactionId);
    expect(result.status).toBe(MockPaymentStatus.Success);
  });
});
```

### 3. **Load Testing**

```javascript
// Artillery.js example
config:
  target: 'https://localhost:7040'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Mock Payment Load Test"
    requests:
      - post:
          url: "/api/mockpayment/quick-test?scenario=success"
          headers:
            Authorization: "Bearer YOUR_TOKEN"
```

## Best Practices

### 1. **Development**
- Sử dụng quick test scenarios cho development nhanh
- Test cả success và failure cases
- Kiểm tra timeout và error handling

### 2. **Demo**
- Sử dụng delays phù hợp (2-3 giây) để tạo trải nghiệm thực tế
- Chuẩn bị sẵn các scenarios khác nhau
- Show dashboard để khách hàng thấy được quản lý giao dịch

### 3. **Production**
- Không deploy mock payment lên production
- Sử dụng feature flags để bật/tắt mock mode
- Log tất cả mock transactions để debug

## Troubleshooting

### 1. **Common Issues**

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| 401 Unauthorized | Token hết hạn | Đăng nhập lại |
| 404 Not Found | Service chưa start | Kiểm tra backend |
| CORS Error | CORS policy | Cấu hình CORS trong Program.cs |
| Transaction Not Found | ID không tồn tại | Kiểm tra transaction ID |

### 2. **Debug Tips**

```csharp
// Enable detailed logging
builder.Services.AddLogging(config => 
{
    config.AddConsole();
    config.SetMinimumLevel(LogLevel.Debug);
});
```

```typescript
// Frontend debugging
localStorage.setItem('mock-payment-debug', 'true');
```

## Roadmap

### 🚀 **Planned Features**
- [ ] Webhook simulation
- [ ] Batch payment processing
- [ ] Payment analytics
- [ ] Export payment reports
- [ ] Real-time payment status updates (SignalR)
- [ ] Mobile app support
- [ ] Multi-currency support
- [ ] Scheduled payments

### 🔧 **Technical Improvements**
- [ ] Database persistence (thay vì in-memory)
- [ ] Redis caching
- [ ] Payment audit logs
- [ ] Performance optimization
- [ ] Automated testing suite

## Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/payment-enhancement`
3. Commit changes: `git commit -am 'Add new payment feature'`
4. Push branch: `git push origin feature/payment-enhancement`
5. Tạo Pull Request

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Support

Nếu có vấn đề hoặc câu hỏi:
- Tạo issue trên GitHub
- Email: support@ecommerce.com
- Documentation: [Wiki](./wiki)

---

**Happy Testing! 🎭💳**