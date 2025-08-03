import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Descriptions,
  List,
  message,
  Card,
  Empty
} from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

const OrderTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const token = localStorage.getItem("authToken");

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:7040/api/order/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await axios.delete(`https://localhost:7040/api/order/user/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("Đã hủy đơn hàng thành công");
      fetchUserOrders(); // Refresh orders
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error("Không thể hủy đơn hàng");
    }
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: `Bạn có chắc chắn muốn hủy đơn hàng ${order.orderId.substring(0, 8)}?`,
      okText: 'Hủy đơn',
      cancelText: 'Không',
      onOk: () => cancelOrder(order.orderId),
    });
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'warning',
      confirmed: 'processing',
      shipping: 'blue',
      delivered: 'success',
      cancelled: 'error'
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return textMap[status] || status;
  };

  const canCancelOrder = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId: string) => (
        <span style={{ fontWeight: 'bold' }}>
          {orderId.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      render: (record: Order) => (
        <div>
          {record.items?.slice(0, 2).map((item, index) => (
            <div key={index}>{item.productName} (x{item.quantity})</div>
          ))}
          {record.items?.length > 2 && (
            <div>... và {record.items.length - 2} sản phẩm khác</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#d9534f' }}>
          {amount.toLocaleString('vi-VN')}đ
        </span>
      ),
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
      title: 'Hành động',
      key: 'actions',
      render: (record: Order) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(record)}
          >
            Chi tiết
          </Button>
          {canCancelOrder(record.status) && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleCancelOrder(record)}
            >
              Hủy đơn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>Đơn hàng của tôi</Title>
        
        {orders.length === 0 && !loading ? (
          <Empty
            description="Bạn chưa có đơn hàng nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        )}
      </Card>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.orderId.substring(0, 8) || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                {selectedOrder.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <span style={{ fontWeight: 'bold', color: '#d9534f' }}>
                  {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20 }}>
              <Title level={5}>Chi tiết sản phẩm</Title>
              <List
                dataSource={selectedOrder.items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.productName}
                      description={`Số lượng: ${item.quantity} | Giá: ${item.price.toLocaleString('vi-VN')}đ`}
                    />
                    <div style={{ fontWeight: 'bold' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {canCancelOrder(selectedOrder.status) && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    setIsModalVisible(false);
                    handleCancelOrder(selectedOrder);
                  }}
                >
                  Hủy đơn hàng
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTab;
