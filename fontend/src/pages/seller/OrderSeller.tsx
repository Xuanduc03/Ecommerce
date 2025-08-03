import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Tabs,
  Button,
  Input,
  DatePicker,
  Select,
  Modal,
  Descriptions,
  List,
  Divider,
  Radio,
  Space,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  message
} from 'antd';
import { SearchOutlined, EyeOutlined, CarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Định nghĩa types
interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'processed' | 'shipping' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingChannel: string;
  trackingNumber?: string;
}

interface FilterState {
  searchText: string;
  dateRange: [string, string] | null;
  shippingChannel: string;
}

const OrderSellerManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    dateRange: null,
    shippingChannel: ''
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping form states
  const [shippingMethod, setShippingMethod] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');


  const token = localStorage.getItem("authToken");

  // Fetch shopId của seller
  const fetchShopForSeller = async () => {
    try {
      const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      console.log("Seller info:", seller);
      if (!seller?.sellerId) return message.error("Không tìm thấy thông tin seller!");

      // Sử dụng API mới để lấy thông tin shop
      const shopRes = await axios.get("https://localhost:7040/api/seller/shop", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = shopRes.data;
      console.log("Shop info:", shop);
      if (!shop?.shopId) return message.error("Seller chưa có cửa hàng!");

      setShopId(shop.shopId);
      console.log("shop", shop.shopId);
    } catch (error) {
      console.error("Error fetching shop info:", error);
      message.error("Không thể tải thông tin Shop cho seller!");
    }
  };
  useEffect(() => {
    fetchShopForSeller();
  }, [token]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching seller orders...");
      const res = await axios.get("https://localhost:7040/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Raw orders response:", res.data);
      const rawOrders = res.data || [];

      const transformedOrders = rawOrders.map((order: any) => ({
        id: order.orderId,
        orderCode: order.orderId.substring(0, 8),
        createdAt: order.orderDate,
        productName: order.items?.[0]?.productName || 'N/A',
        quantity: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
        totalPrice: order.totalAmount,
        status: order.status,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.shippingAddress,
        products: order.items || [],
        shippingChannel: 'standard'
      }));

      setOrders(transformedOrders);
      console.log("Fetched orders:", transformedOrders);

    } catch (error) {
      console.error("Error fetching seller orders:", error);
      message.error("Không thể tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log("Updating order status:", orderId, newStatus);
      await axios.put(`https://localhost:7040/api/seller/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      message.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchSellerOrders(); // Refresh orders
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Không thể cập nhật trạng thái đơn hàng!");
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [token]);

  // Status mapping
  const statusMap = {
    all: 'Tất cả',
    pending: 'Chờ xử lý',
    processed: 'Đã xử lý',
    shipping: 'Đang vận chuyển',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy'
  };

  const statusColors = {
    pending: 'orange',
    processed: 'blue',
    shipping: 'purple',
    completed: 'green',
    cancelled: 'red'
  };

  // Filter orders based on active tab and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Filter by search text
    if (filters.searchText) {
      filtered = filtered.filter(order =>
        order.orderCode.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        order.productName.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    // Filter by shipping channel
    if (filters.shippingChannel) {
      filtered = filtered.filter(order => order.shippingChannel === filters.shippingChannel);
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(filters.dateRange![0]);
        const endDate = new Date(filters.dateRange![1]);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return filtered;
  }, [orders, activeTab, filters]);

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Thời gian đặt hàng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (val: any) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: 'SĐT',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'customerAddress',
      key: 'customerAddress',
      width: 250
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colorMap: { [key: string]: string } = {
          pending: 'warning',
          confirmed: 'processing',
          shipping: 'blue',
          delivered: 'success',
          cancelled: 'error'
        };
        return <Tag color={colorMap[status] || 'default'}>{statusMap[status as keyof typeof statusMap] || status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 300,
      render: (record: Order) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>
          {record.status === 'shipping' && (
            <Button
              type="primary"
              size="small"
              onClick={() => updateOrderStatus(record.id, 'delivered')}
            >
              Đánh dấu đã giao
            </Button>
          )}
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => updateOrderStatus(record.id, 'confirmed')}
            >
              Xác nhận đơn
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button
              type="primary"
              size="small"
              onClick={() => updateOrderStatus(record.id, 'shipping')}
            >
              Giao hàng
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Tab items
  const tabItems = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processed', label: 'Đã xử lý' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'completed', label: 'Hoàn tất' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleArrangeShipping = (order: Order) => {
    setSelectedOrder(order);
    setShippingModalVisible(true);
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleSearch = () => {
    // Search is handled by useMemo automatically
    message.success('Tìm kiếm thành công!');
  };

  const handleConfirmShipping = () => {
    if (!trackingNumber) {
      message.error('Vui lòng nhập mã tracking!');
      return;
    }

    if (shippingMethod === 'pickup' && !pickupDate) {
      message.error('Vui lòng chọn ngày pickup!');
      return;
    }

    message.success('Đã xác nhận giao hàng thành công!');
    setShippingModalVisible(false);
    setTrackingNumber('');
    setPickupDate('');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2} style={{ marginBottom: '24px' }}>
          Quản lý đơn hàng
        </Title>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '24px' }}
        />

        {/* Filters */}
        <Card style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm"
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              />
            </Col>
            <Col span={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={(dates) => {
                  setFilters(prev => ({
                    ...prev,
                    dateRange: dates ? [dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')] : null
                  }));
                }}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Chọn kênh vận chuyển"
                style={{ width: '100%' }}
                value={filters.shippingChannel}
                onChange={(value) => setFilters(prev => ({ ...prev, shippingChannel: value }))}
                allowClear
              >
                <Option value="Giao hàng nhanh">Giao hàng nhanh</Option>
                <Option value="Giao hàng tiết kiệm">Giao hàng tiết kiệm</Option>
                <Option value="Viettel Post">Viettel Post</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button type="primary" onClick={handleSearch} style={{ width: '100%' }}>
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
          }}
          scroll={{ x: 1200 }}
        />

        {/* Detail Modal */}
        <Modal
          title="Chi tiết đơn hàng"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedOrder && (
            <div>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian đặt hàng">
                  {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusColors[selectedOrder.status]}>
                    {statusMap[selectedOrder.status]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tên người nhận">
                  {selectedOrder.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedOrder.customerPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {selectedOrder.customerAddress}
                </Descriptions.Item>
                <Descriptions.Item label="Kênh vận chuyển">
                  {selectedOrder.shippingChannel}
                </Descriptions.Item>
                {selectedOrder.trackingNumber && (
                  <Descriptions.Item label="Mã tracking">
                    <Text code>{selectedOrder.trackingNumber}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider orientation="left">Danh sách sản phẩm</Divider>

              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.products}
                renderItem={(product) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<img src={product.image} alt={product.name} style={{ width: 60, height: 60 }} />}
                      title={product.name}
                      description={`Số lượng: ${product.quantity} | Giá: ${product.price.toLocaleString('vi-VN')} ₫`}
                    />
                  </List.Item>
                )}
              />

              <Divider />

              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  Tổng tiền: {selectedOrder.totalPrice.toLocaleString('vi-VN')} ₫
                </Text>
              </div>
            </div>
          )}
        </Modal>

        {/* Shipping Modal */}
        <Modal
          title="Sắp xếp giao hàng"
          open={shippingModalVisible}
          onCancel={() => setShippingModalVisible(false)}
          onOk={handleConfirmShipping}
          okText="Xác nhận giao hàng"
          cancelText="Hủy"
        >
          {selectedOrder && (
            <div>
              <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                <Descriptions.Item label="Mã đơn hàng">
                  {selectedOrder.orderCode}
                </Descriptions.Item>
                <Descriptions.Item label="Tên sản phẩm">
                  {selectedOrder.productName}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {selectedOrder.customerName}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Thông tin giao hàng</Divider>

              <div style={{ marginBottom: '16px' }}>
                <Text strong>Phương thức giao hàng:</Text>
                <Radio.Group
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  style={{ marginLeft: '16px' }}
                >
                  <Radio value="pickup">Pickup</Radio>
                  <Radio value="dropoff">Drop-off</Radio>
                </Radio.Group>
              </div>

              {shippingMethod === 'pickup' && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Ngày pickup:</Text>
                  <DatePicker
                    style={{ marginLeft: '16px', width: '200px' }}
                    placeholder="Chọn ngày"
                    onChange={(date) => setPickupDate(date ? date.format('YYYY-MM-DD') : '')}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <Text strong>Mã tracking:</Text>
                <Input
                  style={{ marginLeft: '16px', width: '200px' }}
                  placeholder="Nhập mã tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};


export default OrderSellerManager;