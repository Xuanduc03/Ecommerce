import React, { useState } from 'react';
import { Card, Tabs, Button, Space } from 'antd';
import { CreditCard, BarChart3, Info } from 'lucide-react';
import MockPayment from '../../components/Payment/MockPayment';
import MockPaymentDashboard from '../../components/Payment/MockPaymentDashboard';

const MockPaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payment');

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    // Optionally switch to dashboard to see the result
    // setActiveTab('dashboard');
  };

  const handlePaymentFailed = (error: any) => {
    console.log('Payment failed:', error);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Card 
          title={
            <Space>
              <CreditCard size={24} />
              <span>Mock Payment System</span>
            </Space>
          }
          extra={
            <Space>
              <Button 
                type={activeTab === 'payment' ? 'primary' : 'default'}
                icon={<CreditCard size={16} />}
                onClick={() => setActiveTab('payment')}
              >
                Create Payment
              </Button>
              <Button 
                type={activeTab === 'dashboard' ? 'primary' : 'default'}
                icon={<BarChart3 size={16} />}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </Button>
            </Space>
          }
          bordered={false}
          style={{ marginBottom: 0 }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'payment',
                label: (
                  <span>
                    <CreditCard size={16} style={{ marginRight: 8 }} />
                    Payment Simulation
                  </span>
                ),
                children: (
                  <MockPayment 
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentFailed={handlePaymentFailed}
                  />
                )
              },
              {
                key: 'dashboard',
                label: (
                  <span>
                    <BarChart3 size={16} style={{ marginRight: 8 }} />
                    Payment Dashboard
                  </span>
                ),
                children: <MockPaymentDashboard />
              },
              {
                key: 'info',
                label: (
                  <span>
                    <Info size={16} style={{ marginRight: 8 }} />
                    API Information
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Card title="Mock Payment API Endpoints" bordered={false}>
                      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', fontFamily: 'monospace' }}>
                        <h4>Available Endpoints:</h4>
                        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                          <li><strong>POST</strong> /api/mockpayment/create - Create a new mock payment</li>
                          <li><strong>POST</strong> /api/mockpayment/process/{`{transactionId}`} - Process a payment</li>
                          <li><strong>GET</strong> /api/mockpayment/status/{`{orderId}`} - Get payment status</li>
                          <li><strong>GET</strong> /api/mockpayment/verify/{`{transactionId}`} - Verify payment</li>
                          <li><strong>POST</strong> /api/mockpayment/cancel/{`{transactionId}`} - Cancel payment</li>
                          <li><strong>GET</strong> /api/mockpayment/all - Get all payments</li>
                          <li><strong>POST</strong> /api/mockpayment/quick-test?scenario=success|failure|slow|instant - Quick test</li>
                        </ul>
                        
                        <h4 style={{ marginTop: '24px' }}>Example Request Body:</h4>
                        <pre style={{ background: '#ffffff', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'auto' }}>
{`{
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
}`}
                        </pre>

                        <h4 style={{ marginTop: '24px' }}>Response Codes:</h4>
                        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                          <li><code>00</code> - Success</li>
                          <li><code>01</code> - Transaction not found</li>
                          <li><code>05</code> - Payment failed</li>
                          <li><code>97</code> - Invalid signature</li>
                          <li><code>99</code> - Unknown error</li>
                        </ul>

                        <h4 style={{ marginTop: '24px' }}>Payment Statuses:</h4>
                        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                          <li><span style={{ color: '#faad14' }}>●</span> <strong>Pending</strong> - Payment created, waiting to be processed</li>
                          <li><span style={{ color: '#1890ff' }}>●</span> <strong>Processing</strong> - Payment is being processed</li>
                          <li><span style={{ color: '#52c41a' }}>●</span> <strong>Success</strong> - Payment completed successfully</li>
                          <li><span style={{ color: '#ff4d4f' }}>●</span> <strong>Failed</strong> - Payment failed</li>
                          <li><span style={{ color: '#d9d9d9' }}>●</span> <strong>Cancelled</strong> - Payment was cancelled</li>
                          <li><span style={{ color: '#ff7875' }}>●</span> <strong>Expired</strong> - Payment has expired</li>
                        </ul>
                      </div>
                    </Card>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default MockPaymentPage;