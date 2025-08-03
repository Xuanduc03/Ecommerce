import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface MockPaymentProps {
  orderId: string;
  amount: number;
  orderInfo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPaymentComplete?: (success: boolean) => void;
}

const MockPayment: React.FC<MockPaymentProps> = ({
  orderId,
  amount,
  orderInfo,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentComplete
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const navigate = useNavigate();

  const createMockPayment = async () => {
    try {
      setStatus('processing');

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        'https://localhost:7040/api/mock-payment/create',
        {
          orderId,
          amount,
          orderInfo,
          customerName,
          customerEmail,
          customerPhone
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Simulate payment processing
        setTimeout(() => {
          simulatePaymentSuccess(response.data.paymentUrl);
        }, 2000);
      } else {
        setStatus('failed');
        onPaymentComplete?.(false);
      }
    } catch (error) {
      console.error('Error creating mock payment:', error);
      setStatus('failed');
      onPaymentComplete?.(false);
    }
  };

  const simulatePaymentSuccess = async (paymentUrl: string) => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Simulate successful payment callback
      const callbackResponse = await axios.post(
        `https://localhost:7040/api/mock-payment/callback/${orderId}?status=success`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTransactionId(callbackResponse.data.vnp_TransactionNo);
      setStatus('success');
      onPaymentComplete?.(true);

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/payment-callback', {
          state: {
            vnp_ResponseCode: '00',
            vnp_TxnRef: orderId,
            vnp_TransactionStatus: '00',
            paymentMethod: 'mock'
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Error simulating payment success:', error);
      setStatus('failed');
      onPaymentComplete?.(false);
    }
  };

  const simulatePaymentFailure = async () => {
    try {
      setStatus('processing');
      const token = localStorage.getItem("authToken");
      
      // Simulate failed payment callback
      await axios.post(
        `https://localhost:7040/api/mock-payment/callback/${orderId}?status=failed`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setStatus('failed');
      onPaymentComplete?.(false);

      // Redirect to checkout after 3 seconds
      setTimeout(() => {
        navigate('/checkout', {
          state: { paymentFailed: true, orderId }
        });
      }, 3000);

    } catch (error) {
      console.error('Error simulating payment failure:', error);
      setStatus('failed');
      onPaymentComplete?.(false);
    }
  };

  return (
    <div className="mock-payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <CreditCard className="payment-icon" size={32} />
          <h2>Mock Payment Gateway</h2>
        </div>

        <div className="payment-details">
          <div className="amount-section">
            <DollarSign className="amount-icon" size={24} />
            <span className="amount">${amount.toLocaleString()}</span>
          </div>
          
          <div className="order-info">
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Description:</strong> {orderInfo}</p>
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Phone:</strong> {customerPhone}</p>
          </div>
        </div>

        {status === 'idle' && (
          <div className="payment-actions">
            <button 
              className="btn btn-success"
              onClick={createMockPayment}
            >
              <CheckCircle size={20} />
              Simulate Successful Payment
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={simulatePaymentFailure}
            >
              <XCircle size={20} />
              Simulate Failed Payment
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="processing-section">
            <Loader className="loading-icon" size={32} />
            <p>Processing payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-section">
            <CheckCircle className="success-icon" size={48} />
            <h3>Payment Successful!</h3>
            <p>Transaction ID: {transactionId}</p>
            <p>Redirecting to success page...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="failed-section">
            <XCircle className="error-icon" size={48} />
            <h3>Payment Failed!</h3>
            <p>Redirecting to checkout...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .mock-payment-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .payment-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 24px;
          border: 1px solid #e1e5e9;
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e1e5e9;
        }

        .payment-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 24px;
        }

        .payment-icon {
          color: #3498db;
        }

        .payment-details {
          margin-bottom: 24px;
        }

        .amount-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .amount {
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
        }

        .amount-icon {
          color: #27ae60;
        }

        .order-info {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
        }

        .order-info p {
          margin: 4px 0;
          color: #6c757d;
        }

        .order-info strong {
          color: #495057;
        }

        .payment-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
        }

        .btn-danger {
          background: #e74c3c;
          color: white;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .processing-section,
        .success-section,
        .failed-section {
          text-align: center;
          padding: 24px;
        }

        .loading-icon {
          animation: spin 1s linear infinite;
          color: #3498db;
        }

        .success-icon {
          color: #27ae60;
        }

        .error-icon {
          color: #e74c3c;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MockPayment;