# Mock Payment System

Hệ thống thanh toán giả lập (Mock Payment) được tạo ra để test và phát triển tính năng thanh toán mà không cần tích hợp với cổng thanh toán thực.

## Tính năng

### Backend (.NET)

#### 1. Mock Payment Service
- **File**: `EcommerceBe/Services/MockPaymentService.cs`
- **Interface**: `EcommerceBe/Services/Interfaces/IMockPaymentService.cs`
- **Chức năng**:
  - Tạo thanh toán giả lập
  - Xử lý callback thanh toán
  - Validate thanh toán
  - Lưu trữ trạng thái thanh toán trong memory

#### 2. Mock Payment Controller
- **File**: `EcommerceBe/Controllers/MockPaymentController.cs`
- **Endpoints**:
  - `POST /api/mock-payment/create` - Tạo thanh toán giả lập
  - `GET /api/mock-payment/status/{orderId}` - Lấy trạng thái thanh toán
  - `POST /api/mock-payment/callback/{orderId}` - Xử lý callback
  - `POST /api/mock-payment/validate/{orderId}` - Validate thanh toán
  - `GET /api/mock-payment/simulate/{orderId}` - Trang mô phỏng thanh toán

#### 3. DTOs
- **File**: `EcommerceBe/Dto/MockPaymentDto.cs`
- **Classes**:
  - `MockPaymentStatusDto` - Trạng thái thanh toán
  - `MockPaymentRequestDto` - Request tạo thanh toán
  - `MockPaymentResponseDto` - Response thanh toán

### Frontend (React/TypeScript)

#### 1. Mock Payment Component
- **File**: `fontend/src/components/Payment/MockPayment.tsx`
- **Chức năng**:
  - Giao diện thanh toán giả lập
  - Mô phỏng thành công/thất bại
  - Tích hợp với API backend

#### 2. Payment Method Selector
- **File**: `fontend/src/components/Payment/PaymentMethodSelector.tsx`
- **Chức năng**:
  - Chọn phương thức thanh toán
  - Tích hợp Mock Payment vào checkout flow

#### 3. Mock Payment Page
- **File**: `fontend/src/pages/MockPaymentPage/MockPaymentPage.tsx`
- **Chức năng**:
  - Trang test Mock Payment
  - Form nhập dữ liệu thanh toán

#### 4. API Service
- **File**: `fontend/src/utils/mockPaymentApi.ts`
- **Chức năng**:
  - Gọi API Mock Payment
  - Xử lý response/error
  - Helper methods

## Cách sử dụng

### 1. Test Mock Payment

#### Cách 1: Sử dụng trang test
```
http://localhost:5173/mock-payment
```

#### Cách 2: Sử dụng API trực tiếp

```bash
# Tạo thanh toán
curl -X POST https://localhost:7040/api/mock-payment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER-123",
    "amount": 150000,
    "orderInfo": "Test order",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "0123456789"
  }'

# Lấy trạng thái thanh toán
curl -X GET https://localhost:7040/api/mock-payment/status/ORDER-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mô phỏng thành công
curl -X POST https://localhost:7040/api/mock-payment/callback/ORDER-123?status=success \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mô phỏng thất bại
curl -X POST https://localhost:7040/api/mock-payment/callback/ORDER-123?status=failed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Tích hợp vào Checkout

```typescript
import PaymentMethodSelector from '../components/Payment/PaymentMethodSelector';

const CheckoutPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  
  const orderData = {
    orderId: 'ORDER-123',
    amount: 150000,
    orderInfo: 'Test order',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '0123456789'
  };

  return (
    <PaymentMethodSelector
      onMethodSelect={setSelectedMethod}
      selectedMethod={selectedMethod}
      orderData={orderData}
    />
  );
};
```

### 3. Sử dụng API Service

```typescript
import mockPaymentApi from '../utils/mockPaymentApi';

// Tạo thanh toán
const createPayment = async () => {
  try {
    const response = await mockPaymentApi.createMockPayment({
      orderId: 'ORDER-123',
      amount: 150000,
      orderInfo: 'Test order',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '0123456789'
    });
    
    console.log('Payment created:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Mô phỏng flow thanh toán
const simulatePayment = async () => {
  const result = await mockPaymentApi.simulatePaymentFlow({
    orderId: 'ORDER-123',
    amount: 150000,
    orderInfo: 'Test order',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '0123456789'
  }, true); // true = success, false = failed
  
  console.log('Payment result:', result);
};
```

## API Endpoints

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mock-payment/create` | Tạo thanh toán giả lập |
| GET | `/api/mock-payment/status/{orderId}` | Lấy trạng thái thanh toán |
| POST | `/api/mock-payment/callback/{orderId}` | Xử lý callback |
| POST | `/api/mock-payment/validate/{orderId}` | Validate thanh toán |
| GET | `/api/mock-payment/simulate/{orderId}` | Trang mô phỏng thanh toán |

### Request/Response Examples

#### Create Payment Request
```json
{
  "orderId": "ORDER-123",
  "amount": 150000,
  "orderInfo": "Test order",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0123456789"
}
```

#### Create Payment Response
```json
{
  "success": true,
  "paymentUrl": "/mock-payment/ORDER-123?transactionId=MOCK123456",
  "message": "Mock payment URL created successfully",
  "orderId": "ORDER-123"
}
```

#### Payment Status Response
```json
{
  "orderId": "ORDER-123",
  "transactionId": "MOCK123456",
  "status": "pending",
  "amount": 150000,
  "createdAt": "2024-01-01T10:00:00Z",
  "paymentMethod": "mock",
  "bankCode": "MOCK",
  "orderInfo": "Test order"
}
```

## Lưu ý

1. **Memory Storage**: Mock Payment lưu trữ dữ liệu trong memory, sẽ mất khi restart server
2. **Development Only**: Chỉ sử dụng cho development/testing, không dùng production
3. **Security**: Không có validation phức tạp, chỉ để test
4. **Integration**: Tích hợp với hệ thống order hiện tại

## Troubleshooting

### Lỗi thường gặp

1. **CORS Error**: Kiểm tra CORS policy trong backend
2. **Authentication Error**: Đảm bảo token hợp lệ
3. **Order Not Found**: Kiểm tra orderId có tồn tại không
4. **Network Error**: Kiểm tra kết nối API

### Debug

```typescript
// Enable debug logging
console.log('Payment request:', request);
console.log('Payment response:', response);

// Check network tab trong browser
// Check server logs trong backend
```

## Tương lai

- [ ] Lưu trữ trong database thay vì memory
- [ ] Thêm validation phức tạp hơn
- [ ] Tích hợp với notification system
- [ ] Thêm logging chi tiết hơn
- [ ] Unit tests cho Mock Payment