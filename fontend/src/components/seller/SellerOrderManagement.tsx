import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message, Spin, Alert } from 'antd';
import { CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';
import axios from 'axios';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

const SellerOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/order/seller', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      await axios.put(`/api/order/seller/${orderId}/status?status=${newStatus}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders(); // Refresh danh sách
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'shipping':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => text.substring(0, 8).toUpperCase(),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'recipientName',
      key: 'recipientName',
    },
    {
      title: 'SĐT',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'recipientAddress',
      key: 'recipientAddress',
      ellipsis: true,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: Order) => (
        <Space size="middle">
          {record.status === 'Shipping' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={updatingOrder === record.orderId}
              onClick={() => updateOrderStatus(record.orderId, 'Delivered')}
            >
              Đã giao
            </Button>
          )}
          {record.status === 'Processing' && (
            <Button
              type="primary"
              icon={<TruckOutlined />}
              loading={updatingOrder === record.orderId}
              onClick={() => updateOrderStatus(record.orderId, 'Shipping')}
            >
              Đang giao
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Quản Lý Đơn Hàng</h2>
      
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px' }}>
              <h4>Sản phẩm trong đơn:</h4>
              {record.items.map((item, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <strong>{item.productName}</strong> - Số lượng: {item.quantity} - 
                  Giá: {formatCurrency(item.price)}
                </div>
              ))}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default SellerOrderManagement;