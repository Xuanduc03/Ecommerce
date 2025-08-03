import React, { useState } from 'react';
import MockPayment from '../../components/Payment/MockPayment';

const MockPaymentPage: React.FC = () => {
  const [orderData, setOrderData] = useState({
    orderId: '',
    amount: 0,
    orderInfo: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const [showPayment, setShowPayment] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderData.orderId && orderData.amount > 0) {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = (success: boolean) => {
    console.log('Payment completed:', success);
    // You can add additional logic here
  };

  if (showPayment) {
    return (
      <div className="mock-payment-page">
        <div className="page-header">
          <h1>Mock Payment Test</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowPayment(false)}
          >
            Back to Form
          </button>
        </div>
        
        <MockPayment
          orderId={orderData.orderId}
          amount={orderData.amount}
          orderInfo={orderData.orderInfo}
          customerName={orderData.customerName}
          customerEmail={orderData.customerEmail}
          customerPhone={orderData.customerPhone}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    );
  }

  return (
    <div className="mock-payment-page">
      <div className="page-header">
        <h1>Mock Payment Test</h1>
        <p>Test the mock payment functionality with sample data</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="orderId">Order ID *</label>
            <input
              type="text"
              id="orderId"
              name="orderId"
              value={orderData.orderId}
              onChange={handleInputChange}
              placeholder="Enter order ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={orderData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderInfo">Order Info</label>
            <input
              type="text"
              id="orderInfo"
              name="orderInfo"
              value={orderData.orderInfo}
              onChange={handleInputChange}
              placeholder="Enter order description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={orderData.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={orderData.customerEmail}
              onChange={handleInputChange}
              placeholder="Enter customer email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Customer Phone</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={orderData.customerPhone}
              onChange={handleInputChange}
              placeholder="Enter customer phone"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Start Mock Payment
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setOrderData({
                  orderId: `ORDER-${Date.now()}`,
                  amount: 150000,
                  orderInfo: 'Test order for mock payment',
                  customerName: 'John Doe',
                  customerEmail: 'john.doe@example.com',
                  customerPhone: '0123456789'
                });
              }}
            >
              Fill Sample Data
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .mock-payment-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .page-header h1 {
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #6c757d;
          margin: 0;
        }

        .form-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }

        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 500;
          color: #495057;
        }

        .form-group input {
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        @media (max-width: 600px) {
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MockPaymentPage;