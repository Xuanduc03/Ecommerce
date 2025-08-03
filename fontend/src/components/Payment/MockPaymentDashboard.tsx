import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  Alert,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  notification
} from 'antd';
import {
  RefreshCw as Refresh,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockPaymentAPI } from '../../utils/mockPaymentApi';
import type {
  MockPaymentStatusResponse,
  MockPaymentVerification
} from '../../types/payment';
import { MockPaymentStatus, getPaymentStatusName } from '../../types/payment';

const { Search } = Input;
const { Option } = Select;

const MockPaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<MockPaymentStatusResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<MockPaymentStatusResponse | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<MockPaymentVerification | null>(null);
  const [filteredPayments, setFilteredPayments] = useState<MockPaymentStatusResponse[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<MockPaymentStatus | 'all'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchText, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await mockPaymentAPI.getAllPayments();
      setPayments(result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load payments'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchText) {
      filtered = filtered.filter(payment =>
        payment.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: MockPaymentStatus): string => {
    switch (status) {
      case MockPaymentStatus.Success: return 'success';
      case MockPaymentStatus.Failed: return 'error';
      case MockPaymentStatus.Processing: return 'processing';
      case MockPaymentStatus.Pending: return 'warning';
      case MockPaymentStatus.Cancelled: return 'default';
      case MockPaymentStatus.Expired: return 'volcano';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: MockPaymentStatus) => {
    switch (status) {
      case MockPaymentStatus.Success: return <CheckCircle size={14} />;
      case MockPaymentStatus.Failed: return <XCircle size={14} />;
      case MockPaymentStatus.Processing: return <Clock size={14} />;
      case MockPaymentStatus.Pending: return <AlertCircle size={14} />;
      case MockPaymentStatus.Cancelled: return <X size={14} />;
      case MockPaymentStatus.Expired: return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleViewDetails = async (payment: MockPaymentStatusResponse) => {
    try {
      setSelectedPayment(payment);
      const verification = await mockPaymentAPI.verifyPayment(payment.transactionId);
      setVerificationDetails(verification);
      setDetailsVisible(true);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load payment details'
      });
    }
  };

  const handleCancelPayment = async (transactionId: string) => {
    try {
      await mockPaymentAPI.cancelPayment(transactionId);
      notification.success({
        message: 'Success',
        description: 'Payment cancelled successfully'
      });
      loadPayments();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to cancel payment'
      });
    }
  };

  const getStatistics = () => {
    const total = payments.length;
    const success = payments.filter(p => p.status === MockPaymentStatus.Success).length;
    const failed = payments.filter(p => p.status === MockPaymentStatus.Failed).length;
    const pending = payments.filter(p => p.status === MockPaymentStatus.Pending).length;
    const processing = payments.filter(p => p.status === MockPaymentStatus.Processing).length;

    return { total, success, failed, pending, processing };
  };

  const stats = getStatistics();

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
          {text}
        </code>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: MockPaymentStatus) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getPaymentStatusName(status)}
        </Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: MockPaymentStatusResponse) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          {(record.status === MockPaymentStatus.Pending || record.status === MockPaymentStatus.Processing) && (
            <Button
              danger
              size="small"
              icon={<X size={14} />}
              onClick={() => handleCancelPayment(record.transactionId)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Mock Payment Dashboard" bordered={false}>
        <Alert
          message="Payment Management Dashboard"
          description="Monitor and manage all mock payment transactions. This dashboard shows real-time payment status and allows you to view details and cancel pending payments."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic title="Total Payments" value={stats.total} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Successful" 
                value={stats.success} 
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircle size={16} />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Failed" 
                value={stats.failed} 
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<XCircle size={16} />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Pending" 
                value={stats.pending} 
                valueStyle={{ color: '#faad14' }}
                prefix={<AlertCircle size={16} />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Processing" 
                value={stats.processing} 
                valueStyle={{ color: '#1890ff' }}
                prefix={<Clock size={16} />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic 
                title="Success Rate" 
                value={stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}
                suffix="%"
                valueStyle={{ color: stats.total > 0 && stats.success / stats.total > 0.8 ? '#52c41a' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="Search by Order ID or Transaction ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Statuses</Option>
              <Option value={MockPaymentStatus.Pending}>Pending</Option>
              <Option value={MockPaymentStatus.Processing}>Processing</Option>
              <Option value={MockPaymentStatus.Success}>Success</Option>
              <Option value={MockPaymentStatus.Failed}>Failed</Option>
              <Option value={MockPaymentStatus.Cancelled}>Cancelled</Option>
              <Option value={MockPaymentStatus.Expired}>Expired</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<Refresh size={16} />}
              onClick={loadPayments}
              loading={loading}
              block
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="transactionId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
          }}
          scroll={{ x: 800 }}
        />

        {/* Payment Details Modal */}
        <Modal
          title="Payment Details"
          open={detailsVisible}
          onCancel={() => setDetailsVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsVisible(false)}>
              Close
            </Button>
          ]}
          width={600}
        >
          {selectedPayment && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Descriptions title="Payment Information" bordered column={1}>
                <Descriptions.Item label="Order ID">{selectedPayment.orderId}</Descriptions.Item>
                <Descriptions.Item label="Transaction ID">
                  <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
                    {selectedPayment.transactionId}
                  </code>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedPayment.status)} icon={getStatusIcon(selectedPayment.status)}>
                    {getPaymentStatusName(selectedPayment.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Message">{selectedPayment.message}</Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(selectedPayment.lastUpdated).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {verificationDetails && (
                <Descriptions title="Verification Details" bordered column={1}>
                  <Descriptions.Item label="Is Valid">
                    <Tag color={verificationDetails.isValid ? 'success' : 'error'}>
                      {verificationDetails.isValid ? 'Valid' : 'Invalid'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Verification Message">
                    {verificationDetails.message}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Space>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default MockPaymentDashboard;