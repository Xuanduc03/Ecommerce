import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Home, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './OrderSuccess.scss';

const OrderSuccess: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state?.orderId) {
      navigate('/');
      return;
    }

    fetchOrderDetails();
  }, [state]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://localhost:7040/api/order/${state.orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="order-success-container">
      <div className="success-content">
        <div className="success-header">
          <CheckCircle className="success-icon" size={64} />
          <h1>Đặt hàng thành công!</h1>
          <p>Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng</p>
        </div>

        <div className="order-info">
          <h3>Thông tin đơn hàng</h3>
          <div className="info-item">
            <span>Mã đơn hàng:</span>
            <strong>{state.orderId}</strong>
            <Copy 
              className="copy-icon" 
              onClick={() => copyToClipboard(state.orderId)}
            />
          </div>
          <div className="info-item">
            <span>Phương thức thanh toán:</span>
            <strong>
              {state.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
              {state.paymentMethod === 'vnpay' && 'VNPay'}
              {state.paymentMethod === 'banking' && 'Chuyển khoản ngân hàng'}
            </strong>
          </div>
          {orderDetails && (
            <>
              <div className="info-item">
                <span>Tổng tiền:</span>
                <strong>{orderDetails.totalPrice?.toLocaleString()}đ</strong>
              </div>
              <div className="info-item">
                <span>Trạng thái:</span>
                <strong>
                  {orderDetails.status === 'pending' && 'Chờ thanh toán'}
                  {orderDetails.status === 'confirmed' && 'Đã xác nhận'}
                  {orderDetails.status === 'paid' && 'Đã thanh toán'}
                </strong>
              </div>
            </>
          )}
        </div>

        {/* Thông tin giao hàng */}
        {orderDetails && orderDetails.shippingAddress && (
          <div className="shipping-info">
            <h3>Thông tin giao hàng</h3>
            <div className="info-item">
              <span>Người nhận:</span>
              <strong>{orderDetails.shippingAddress}</strong>
            </div>
          </div>
        )}

        {/* Hiển thị thông tin chuyển khoản nếu là banking */}
        {state.paymentMethod === 'banking' && state.bankInfo && (
          <div className="banking-info">
            <h3>Thông tin chuyển khoản</h3>
            <div className="bank-details">
              <div className="bank-item">
                <span>Ngân hàng:</span>
                <strong>{state.bankInfo.bankName}</strong>
              </div>
              <div className="bank-item">
                <span>Số tài khoản:</span>
                <div className="copyable">
                  <strong>{state.bankInfo.accountNumber}</strong>
                  <Copy 
                    className="copy-icon" 
                    onClick={() => copyToClipboard(state.bankInfo.accountNumber)}
                  />
                </div>
              </div>
              <div className="bank-item">
                <span>Chủ tài khoản:</span>
                <strong>{state.bankInfo.accountName}</strong>
              </div>
              <div className="bank-item">
                <span>Số tiền:</span>
                <div className="copyable">
                  <strong>{state.bankInfo.amount.toLocaleString()}đ</strong>
                  <Copy 
                    className="copy-icon" 
                    onClick={() => copyToClipboard(state.bankInfo.amount.toString())}
                  />
                </div>
              </div>
              <div className="bank-item">
                <span>Nội dung chuyển khoản:</span>
                <div className="copyable">
                  <strong>{state.bankInfo.content}</strong>
                  <Copy 
                    className="copy-icon" 
                    onClick={() => copyToClipboard(state.bankInfo.content)}
                  />
                </div>
              </div>
            </div>
            <div className="banking-note">
              <p><strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh chóng.</p>
            </div>
          </div>
        )}

        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/order')}
          >
            <FileText size={20} />
            Xem đơn hàng
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;