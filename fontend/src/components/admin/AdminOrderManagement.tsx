import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Select, Input, message, Spin, Alert, Modal } from 'antd';
import { CheckCircleOutlined, TruckOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

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
  userName: string;
}

const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/order', {
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
      await axios.put(`/api/order/admin/${orderId}/status?status=${newStatus}`, {}, {
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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = searchText === '' || 
      order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      order.recipientName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => text.substring(0, 8).toUpperCase(),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Người nhận',
      dataIndex: 'recipientName',
      key: 'recipientName',
    },
    {
      title: 'SĐT',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
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
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            Chi tiết
          </Button>
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
          {record.status === 'Pending' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={updatingOrder === record.orderId}
              onClick={() => updateOrderStatus(record.orderId, 'Processing')}
            >
              Xử lý
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
      <h2 style={{ marginBottom: '24px' }}>Quản Lý Đơn Hàng Toàn Hệ Thống</h2>
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          placeholder="Lọc theo trạng thái"
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="pending">Chờ xử lý</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="shipping">Đang giao</Option>
          <Option value="delivered">Đã giao</Option>
          <Option value="cancelled">Đã huỷ</Option>
        </Select>
        
        <Search
          placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredOrders}
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
              <strong>Khách hàng:</strong> {selectedOrder.userName}
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

export default AdminOrderManagement;