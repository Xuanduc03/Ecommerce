import React, { useState } from 'react';
import { CreditCard, Banknote, TestTube } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: string) => void;
  selectedMethod: string;
  orderData: {
    orderId: string;
    amount: number;
    orderInfo: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod,
  orderData
}) => {
  const [showMockPayment, setShowMockPayment] = useState(false);

  const paymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua VNPay',
      icon: CreditCard,
      color: '#0055a4'
    },
    {
      id: 'mock',
      name: 'Mock Payment',
      description: 'Thanh toán giả lập (Test)',
      icon: TestTube,
      color: '#ff6b35'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Thanh toán khi nhận hàng',
      icon: Banknote,
      color: '#27ae60'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    onMethodSelect(methodId);
    if (methodId === 'mock') {
      setShowMockPayment(true);
    } else {
      setShowMockPayment(false);
    }
  };

  if (showMockPayment) {
    return (
      <div className="payment-method-container">
        <div className="method-header">
          <button 
            className="btn btn-back"
            onClick={() => {
              setShowMockPayment(false);
              onMethodSelect('');
            }}
          >
            ← Back to Payment Methods
          </button>
        </div>
        
        <div className="mock-payment-section">
          <h3>Mock Payment Gateway</h3>
          <p>This is a test payment gateway for development purposes.</p>
          
          <div className="order-summary">
            <h4>Order Summary</h4>
            <div className="summary-item">
              <span>Order ID:</span>
              <span>{orderData.orderId}</span>
            </div>
            <div className="summary-item">
              <span>Amount:</span>
              <span>${orderData.amount.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span>Description:</span>
              <span>{orderData.orderInfo}</span>
            </div>
          </div>

          <div className="mock-actions">
            <button 
              className="btn btn-success"
              onClick={() => {
                // Simulate successful payment
                console.log('Mock payment success');
                onMethodSelect('mock_success');
              }}
            >
              <TestTube size={20} />
              Simulate Success
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => {
                // Simulate failed payment
                console.log('Mock payment failed');
                onMethodSelect('mock_failed');
              }}
            >
              <TestTube size={20} />
              Simulate Failure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-method-container">
      <h3>Choose Payment Method</h3>
      
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-card ${
              selectedMethod === method.id ? 'selected' : ''
            }`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="method-icon" style={{ color: method.color }}>
              <method.icon size={24} />
            </div>
            <div className="method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
            </div>
            <div className="method-check">
              {selectedMethod === method.id && (
                <div className="checkmark">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .payment-method-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .method-header {
          margin-bottom: 20px;
        }

        .btn-back {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          font-size: 14px;
          padding: 8px 0;
        }

        .btn-back:hover {
          text-decoration: underline;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-method-card {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .payment-method-card:hover {
          border-color: #3498db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .payment-method-card.selected {
          border-color: #3498db;
          background: #f8f9ff;
        }

        .method-icon {
          margin-right: 16px;
          flex-shrink: 0;
        }

        .method-info {
          flex: 1;
        }

        .method-info h4 {
          margin: 0 0 4px 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .method-info p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .method-check {
          margin-left: 12px;
        }

        .checkmark {
          color: #27ae60;
          font-weight: bold;
          font-size: 18px;
        }

        .mock-payment-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .mock-payment-section h3 {
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .mock-payment-section p {
          color: #6c757d;
          margin-bottom: 20px;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .order-summary h4 {
          margin: 0 0 12px 0;
          color: #495057;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-item span:first-child {
          color: #6c757d;
          font-weight: 500;
        }

        .summary-item span:last-child {
          color: #2c3e50;
          font-weight: 600;
        }

        .mock-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
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

        @media (max-width: 600px) {
          .mock-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodSelector;