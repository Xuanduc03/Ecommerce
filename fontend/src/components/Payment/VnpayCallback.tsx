import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    try {
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // orderId
      const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');

      if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
        // Thanh toán thành công
        setStatus('success');
        
        // Có thể gọi API để cập nhật trạng thái order
        const token = localStorage.getItem("authToken");
        await axios.put(
          `https://localhost:7040/api/order/${vnp_TxnRef}/payment-success`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch order details
        const orderResponse = await axios.get(
          `https://localhost:7040/api/order/${vnp_TxnRef}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrderInfo(orderResponse.data);

        // Redirect sau 3 giây
        setTimeout(() => {
          navigate('/order-success', {
            state: {
              orderId: vnp_TxnRef,
              paymentMethod: 'vnpay',
              paymentStatus: 'success'
            }
          });
        }, 3000);

      } else {
        // Thanh toán thất bại
        setStatus('failed');
        setTimeout(() => {
          navigate('/checkout', {
            state: { paymentFailed: true, orderId: vnp_TxnRef }
          });
        }, 3000);
      }

    } catch (error) {
      console.error('Error processing payment callback:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="payment-callback-container">
      <div className="callback-content">
        {status === 'loading' && (
          <>
            <Loader className="loading-icon" size={64} />
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="success-icon" size={64} />
            <h2>Thanh toán thành công!</h2>
            <p>Đơn hàng của bạn đã được thanh toán thành công</p>
            {orderInfo && (
              <div className="order-summary">
                <p>Mã đơn hàng: <strong>{orderInfo.id}</strong></p>
                <p>Số tiền: <strong>{orderInfo.totalPrice?.toLocaleString()}đ</strong></p>
              </div>
            )}
            <p className="redirect-text">Đang chuyển hướng...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="error-icon" size={64} />
            <h2>Thanh toán thất bại!</h2>
            <p>Đã có lỗi xảy ra trong quá trình thanh toán</p>
            <p className="redirect-text">Đang chuyển về trang checkout...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;