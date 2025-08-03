import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message, Spin, Alert, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
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

const UserOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/order/user', {
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

  const cancelOrder = async (orderId: string) => {
    try {
      setCancellingOrder(orderId);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/order/user/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      message.success('Huỷ đơn hàng thành công');
      fetchOrders(); // Refresh danh sách
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Có lỗi xảy ra khi huỷ đơn hàng');
    } finally {
      setCancellingOrder(null);
    }
  };

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const canCancelOrder = (status: string) => {
    return status === 'Pending' || status === 'Processing';
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => text.substring(0, 8).toUpperCase(),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      render: (_, record: Order) => (
        <div>
          {record.items.slice(0, 2).map((item, index) => (
            <div key={index}>{item.productName} (x{item.quantity})</div>
          ))}
          {record.items.length > 2 && (
            <div style={{ color: '#666' }}>... và {record.items.length - 2} sản phẩm khác</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount),
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
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            Chi tiết
          </Button>
          {canCancelOrder(record.status) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn huỷ đơn hàng này?"
              onConfirm={() => cancelOrder(record.orderId)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={cancellingOrder === record.orderId}
              >
                Huỷ đơn
              </Button>
            </Popconfirm>
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
      <h2 style={{ marginBottom: '24px' }}>Quản Lý Đơn Hàng Của Tôi</h2>
      
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
      />

      <Modal
        title="Chi Tiết Đơn Hàng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Mã đơn:</strong> {selectedOrder.orderId.substring(0, 8).toUpperCase()}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Người nhận:</strong> {selectedOrder.recipientName}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>SĐT:</strong> {selectedOrder.recipientPhone}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Địa chỉ:</strong> {selectedOrder.recipientAddress}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Trạng thái:</strong> 
              <Tag color={getStatusColor(selectedOrder.status)} style={{ marginLeft: '8px' }}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}
            </div>
            
            <div>
              <strong>Sản phẩm:</strong>
              {selectedOrder.items.map((item, index) => (
                <div key={index} style={{ marginTop: '8px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                  <div><strong>{item.productName}</strong></div>
                  <div>Số lượng: {item.quantity}</div>
                  <div>Giá: {formatCurrency(item.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserOrderManagement;