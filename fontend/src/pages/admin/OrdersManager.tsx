import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Modal,
  message,
  Select,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

// Kiểu dữ liệu Order
interface Order {
  orderId: string;
  userId: string;
  shopId: string;
  shippingAddressId: string;
  createdAt: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  userName: string;
  user?: {
    userId: string;
    username?: string;
    email?: string;
    fullName?: string;
  };
  shop?: {
    shopId: string;
    name: string;
    sellerId: string;
  };
  shippingAddressDetails?: {
    fullName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  items?: {
    productName: string;
    quantity: number;
    price: number;
    productId: string;
  }[];
}

// API base URL (thay theo backend của bạn)
const API_URL = "https://localhost:7040/api/order";

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined
  );
  const [filterSeller, setFilterSeller] = useState<string | undefined>(
    undefined
  );
  const [sellers, setSellers] = useState<any[]>([]);

  const token = localStorage.getItem("authToken");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data || response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSellers = useCallback(async () => {
    try {
      const response = await axios.get("https://localhost:7040/api/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(response.data || []);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
    fetchSellers();
  }, [fetchOrders, fetchSellers]);

  // Xử lý lọc
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchText ||
      order.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSeller = !filterSeller || order.shopId === filterSeller;
    return matchesSearch && matchesStatus && matchesSeller;
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      width: 120,
      render: (id) => <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{id.slice(0, 8)}...</span>,
    },
    {
      title: "Khách hàng",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.user?.fullName || record.user?.username || "Ẩn danh"}
          </div>
          {record.user?.email && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Cửa hàng",
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.shop?.name || "N/A"}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.shopId.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      width: 200,
      render: (_, record) => {
        const items = record.items || [];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {items.length} loại, {totalItems} sản phẩm
            </div>
            {items.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {items[0].productName}
                {items.length > 1 && ` và ${items.length - 1} sản phẩm khác`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Địa chỉ giao hàng",
      width: 200,
      render: (_, record) => {
        const addr = record.shippingAddressDetails;
        if (!addr) return "N/A";
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {addr.fullName}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {addr.phoneNumber}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {addr.ward}, {addr.district}, {addr.city}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      width: 120,
      align: "right",
      render: (val) => (
        <span style={{ fontWeight: 'bold', color: '#d4380d' }}>
          {val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      width: 100,
      render: (method) => <Tag color="blue">{method.toUpperCase()}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 110,
      render: (status) => {
        const colors: Record<string, string> = {
          pending: "gold",
          processing: "blue",
          shipped: "purple",
          delivered: "green",
          cancelled: "red",
        };
        const labels: Record<string, string> = {
          pending: "Chờ xử lý",
          processing: "Đang xử lý",
          shipped: "Đã giao",
          delivered: "Hoàn tất",
          cancelled: "Đã hủy",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      width: 110,
      render: (date) => (
        <div>
          <div>{new Date(date).toLocaleDateString("vi-VN")}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(date).toLocaleTimeString("vi-VN", { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          <Select
            value={record.status}
            style={{ width: 110 }}
            size="small"
            onChange={(value) => handleUpdateStatus(record.orderId, value)}
            options={[
              { value: "pending", label: "Chờ xử lý" },
              { value: "processing", label: "Đang xử lý" },
              { value: "shipped", label: "Đã giao" },
              { value: "delivered", label: "Hoàn tất" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Quản lý đơn hàng (Seller)</Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm theo tên khách hoặc mã đơn"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            style={{ width: "100%" }}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { value: "pending", label: "Chờ xử lý" },
              { value: "processing", label: "Đang xử lý" },
              { value: "shipped", label: "Đã giao" },
              { value: "delivered", label: "Hoàn tất" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
          />
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Lọc theo shop"
            style={{ width: "100%" }}
            value={filterSeller}
            onChange={(val) => setFilterSeller(val)}
            options={sellers.map(seller => ({
              value: seller.shopId,
              label: seller.shopName || `Shop ${seller.sellerId.substring(0, 8)}`
            }))}
          />
        </Col>
        <Col span={4} style={{ textAlign: "right" }}>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
            Tải lại
          </Button>
        </Col>
        <Col span={4}>
          <Button 
            onClick={() => {
              setSearchText("");
              setFilterStatus(undefined);
              setFilterSeller(undefined);
            }}
          >
            Xóa bộ lọc
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="orderId"
        dataSource={filteredOrders}
        columns={columns}
        loading={loading}
        pagination={{ 
          pageSize: 10, 
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
        }}
        scroll={{ x: 1600 }}
      />

      {/* Modal chi tiết */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.orderId.slice(0, 8) || ""}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            {/* Thông tin đơn hàng */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Card title="Thông tin khách hàng" size="small">
                  <p><strong>Họ tên:</strong> {selectedOrder.user?.fullName || selectedOrder.user?.username || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || "N/A"}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin đơn hàng" size="small">
                  <p><strong>Mã đơn:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}</p>
                  <p><strong>Trạng thái:</strong> 
                    <Tag color={
                      selectedOrder.status === 'pending' ? 'gold' :
                      selectedOrder.status === 'processing' ? 'blue' :
                      selectedOrder.status === 'shipped' ? 'purple' :
                      selectedOrder.status === 'delivered' ? 'green' : 'red'
                    }>
                      {selectedOrder.status === 'pending' ? 'Chờ xử lý' :
                       selectedOrder.status === 'processing' ? 'Đang xử lý' :
                       selectedOrder.status === 'shipped' ? 'Đã giao' :
                       selectedOrder.status === 'delivered' ? 'Hoàn tất' : 'Đã hủy'}
                    </Tag>
                  </p>
                  <p><strong>Thanh toán:</strong> <Tag color="blue">{selectedOrder.paymentMethod.toUpperCase()}</Tag></p>
                </Card>
              </Col>
            </Row>

            {/* Địa chỉ giao hàng */}
            {selectedOrder.shippingAddressDetails && (
              <Card title="Địa chỉ giao hàng" size="small" style={{ marginBottom: 20 }}>
                <p><strong>Người nhận:</strong> {selectedOrder.shippingAddressDetails.fullName}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddressDetails.phoneNumber}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddressDetails.street}, {selectedOrder.shippingAddressDetails.ward}, {selectedOrder.shippingAddressDetails.district}, {selectedOrder.shippingAddressDetails.city}</p>
              </Card>
            )}

            {/* Sản phẩm trong đơn hàng */}
            <Card title="Sản phẩm đã đặt" size="small">
              {selectedOrder.items?.length ? (
                <Table
                  rowKey={(item) => item.productId}
                  dataSource={selectedOrder.items}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: "Sản phẩm", dataIndex: "productName", width: 300 },
                    { 
                      title: "Số lượng", 
                      dataIndex: "quantity", 
                      align: "center",
                      width: 100
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "price",
                      width: 150,
                      align: "right",
                      render: (val) =>
                        val.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }),
                    },
                    {
                      title: "Thành tiền",
                      width: 150,
                      align: "right",
                      render: (_, record) => (
                        <strong style={{ color: '#d4380d' }}>
                          {(record.price * record.quantity).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </strong>
                      ),
                    },
                  ]}
                  summary={(pageData) => {
                    const totalQuantity = pageData.reduce((sum, item) => sum + item.quantity, 0);
                    const totalAmount = pageData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="center">
                          <strong>{totalQuantity}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">
                          <strong style={{ color: '#d4380d', fontSize: '16px' }}>
                            {totalAmount.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              ) : (
                <p>Không có sản phẩm nào trong đơn</p>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default OrderManager;

