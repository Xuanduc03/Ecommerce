import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Alert,
  Tag,
  Space,
  Row,
  Col,
  notification,
  Spin
} from 'antd';
import {
  Settings,
  Play,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockPaymentAPI } from '../../utils/mockPaymentApi';
import type {
  MockPaymentRequest,
  PaymentScenario,
  PaymentMethodOption
} from '../../types/payment';
import { MockPaymentStatus, getPaymentStatusName } from '../../types/payment';

const { Option } = Select;
const { TextArea } = Input;

interface MockPaymentProps {
  orderId?: string;
  amount?: number;
  onPaymentSuccess?: (result: any) => void;
  onPaymentFailed?: (error: any) => void;
}

const MockPayment: React.FC<MockPaymentProps> = ({
  orderId: propOrderId,
  amount: propAmount,
  onPaymentSuccess,
  onPaymentFailed
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const paymentMethods: PaymentMethodOption[] = [
    { value: 'MOCK', label: 'Mock Payment', icon: '🎭', description: 'Simulation payment for testing' },
    { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳', description: 'Simulate credit card payment' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', description: 'Simulate bank transfer' },
    { value: 'WALLET', label: 'Digital Wallet', icon: '👛', description: 'Simulate wallet payment' }
  ];

  const predefinedScenarios: PaymentScenario[] = [
    {
      id: 'success',
      name: 'Success - Normal',
      description: 'Payment succeeds after 2 seconds',
      simulation: { shouldSucceed: true, delaySeconds: 2, bankCode: 'MOCK_BANK' }
    },
    {
      id: 'success-instant',
      name: 'Success - Instant',
      description: 'Payment succeeds immediately',
      simulation: { shouldSucceed: true, delaySeconds: 0, bankCode: 'INSTANT_BANK' }
    },
    {
      id: 'success-slow',
      name: 'Success - Slow',
      description: 'Payment succeeds after 5 seconds (slow processing)',
      simulation: { shouldSucceed: true, delaySeconds: 5, bankCode: 'SLOW_BANK' }
    },
    {
      id: 'failure-insufficient',
      name: 'Failure - Insufficient Funds',
      description: 'Payment fails due to insufficient funds',
      simulation: { 
        shouldSucceed: false, 
        delaySeconds: 1, 
        failureReason: 'Insufficient funds',
        bankCode: 'MOCK_BANK'
      }
    },
    {
      id: 'failure-expired',
      name: 'Failure - Card Expired',
      description: 'Payment fails due to expired card',
      simulation: { 
        shouldSucceed: false, 
        delaySeconds: 2, 
        failureReason: 'Card has expired',
        bankCode: 'MOCK_BANK'
      }
    }
  ];

  const getStatusColor = (status: MockPaymentStatus) => {
    switch (status) {
      case MockPaymentStatus.Success: return 'success';
      case MockPaymentStatus.Failed: return 'error';
      case MockPaymentStatus.Processing: return 'processing';
      case MockPaymentStatus.Pending: return 'warning';
      case MockPaymentStatus.Cancelled: return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: MockPaymentStatus) => {
    switch (status) {
      case MockPaymentStatus.Success: return <CheckCircle size={16} />;
      case MockPaymentStatus.Failed: return <XCircle size={16} />;
      case MockPaymentStatus.Processing: return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleQuickTest = async (scenario: string) => {
    try {
      setLoading(true);
      notification.info({
        message: 'Creating Test Payment',
        description: `Creating ${scenario} scenario test payment...`
      });

      const response = await mockPaymentAPI.createQuickTestPayment(scenario);
      
      if (response.success) {
        notification.success({
          message: 'Test Payment Created',
          description: `Transaction ID: ${response.transactionId}`
        });
        
        // Automatically process the payment
        await handleProcessPayment(response.transactionId);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to create test payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (transactionId: string) => {
    try {
      setProcessing(true);
      const result = await mockPaymentAPI.processPayment(transactionId);
      setPaymentResult(result);

      if (result.status === MockPaymentStatus.Success) {
        notification.success({
          message: 'Payment Successful!',
          description: `Transaction ${transactionId} completed successfully`
        });
        onPaymentSuccess?.(result);
      } else {
        notification.error({
          message: 'Payment Failed!',
          description: result.message || 'Payment processing failed'
        });
        onPaymentFailed?.(result);
      }
    } catch (error) {
      notification.error({
        message: 'Processing Error',
        description: 'Failed to process payment'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setPaymentResult(null);

      const request: MockPaymentRequest = {
        orderId: values.orderId || `ORDER_${Date.now()}`,
        amount: values.amount,
        orderInfo: values.orderInfo || `Payment for order ${values.orderId}`,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        paymentMethod: values.paymentMethod,
        simulation: {
          shouldSucceed: values.shouldSucceed,
          delaySeconds: values.delaySeconds,
          failureReason: values.shouldSucceed ? undefined : values.failureReason,
          bankCode: values.bankCode
        }
      };

      const response = await mockPaymentAPI.createPayment(request);
      
      if (response.success) {
        notification.success({
          message: 'Payment Created',
          description: `Transaction ID: ${response.transactionId}`
        });

        // Automatically process the payment
        await handleProcessPayment(response.transactionId);
      } else {
        notification.error({
          message: 'Creation Failed',
          description: response.message
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to create payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyScenario = (scenario: PaymentScenario) => {
    form.setFieldsValue({
      shouldSucceed: scenario.simulation.shouldSucceed,
      delaySeconds: scenario.simulation.delaySeconds,
      failureReason: scenario.simulation.failureReason || '',
      bankCode: scenario.simulation.bankCode || 'MOCK_BANK'
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card title="Mock Payment Simulation" bordered={false}>
        <Alert
          message="Payment Simulation Tool"
          description="This tool allows you to simulate different payment scenarios for testing purposes. Configure payment parameters and test various success/failure cases."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                orderId: propOrderId || `ORDER_${Date.now()}`,
                amount: propAmount || 100000,
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '0123456789',
                paymentMethod: 'MOCK',
                shouldSucceed: true,
                delaySeconds: 2,
                bankCode: 'MOCK_BANK',
                orderInfo: 'Test payment order'
              }}
            >
              <Card title="Payment Information" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Order ID"
                      name="orderId"
                      rules={[{ required: true, message: 'Please enter order ID' }]}
                    >
                      <Input placeholder="ORDER_123456" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Amount (VND)"
                      name="amount"
                      rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={1000}
                        max={100000000}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value: any) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Order Information" name="orderInfo">
                  <TextArea rows={2} placeholder="Payment for order..." />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Customer Name"
                      name="customerName"
                      rules={[{ required: true, message: 'Please enter customer name' }]}
                    >
                      <Input placeholder="John Doe" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Email"
                      name="customerEmail"
                      rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter valid email' }
                      ]}
                    >
                      <Input placeholder="john@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Phone"
                      name="customerPhone"
                      rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                      <Input placeholder="0123456789" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Payment Method" name="paymentMethod">
                  <Select>
                    {paymentMethods.map(method => (
                      <Option key={method.value} value={method.value}>
                        <Space>
                          <span>{method.icon}</span>
                          <span>{method.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              <Card title={<><Settings size={16} /> Simulation Settings</>} size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Should Succeed" name="shouldSucceed" valuePropName="checked">
                      <Switch 
                        checkedChildren="Success" 
                        unCheckedChildren="Failure"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Processing Delay (seconds)" name="delaySeconds">
                      <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.shouldSucceed !== curValues.shouldSucceed}>
                  {({ getFieldValue }) => 
                    !getFieldValue('shouldSucceed') && (
                      <Form.Item label="Failure Reason" name="failureReason">
                        <Input placeholder="Insufficient funds, Card expired, etc." />
                      </Form.Item>
                    )
                  }
                </Form.Item>

                <Form.Item label="Bank Code" name="bankCode">
                  <Input placeholder="MOCK_BANK" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading || processing} 
                    icon={<Play size={16} />}
                    block
                  >
                    {processing ? 'Processing Payment...' : 'Create & Process Payment'}
                  </Button>
                </Form.Item>
              </Card>
            </Form>
          </Col>

          <Col span={8}>
            <Card title="Quick Test Scenarios" size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {predefinedScenarios.map(scenario => (
                  <Card 
                    key={scenario.id} 
                    size="small" 
                    hoverable
                    onClick={() => applyScenario(scenario)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Meta
                      title={<span style={{ fontSize: '14px' }}>{scenario.name}</span>}
                      description={scenario.description}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickTest(scenario.id);
                        }}
                        loading={loading}
                      >
                        Run Test
                      </Button>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>

            {paymentResult && (
              <Card title="Payment Result" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Status:</strong>
                    <Tag 
                      color={getStatusColor(paymentResult.status)} 
                      icon={getStatusIcon(paymentResult.status)}
                      style={{ marginLeft: 8 }}
                    >
                      {getPaymentStatusName(paymentResult.status)}
                    </Tag>
                  </div>
                  <div><strong>Transaction ID:</strong> {paymentResult.transactionId}</div>
                  <div><strong>Order ID:</strong> {paymentResult.orderId}</div>
                  <div><strong>Amount:</strong> {paymentResult.amount?.toLocaleString()} VND</div>
                  <div><strong>Message:</strong> {paymentResult.message}</div>
                  <div><strong>Response Code:</strong> {paymentResult.responseCode}</div>
                  {paymentResult.bankCode && (
                    <div><strong>Bank:</strong> {paymentResult.bankCode}</div>
                  )}
                </Space>
              </Card>
            )}

            {processing && (
              <Card size="small" style={{ textAlign: 'center', marginTop: 16 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <strong>Processing Payment...</strong>
                  <div>Please wait while we process your payment</div>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MockPayment;