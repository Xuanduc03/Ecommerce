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
  shippingAddress?: string;
  user?: {
    username: string;
    email?: string;
  };
  shop?: {
    shopId: string;
    shopName: string;
  };
  orderItems?: {
    productName: string;
    quantity: number;
    price: number;
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
      width: 60,
      align: "center",
    },
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      render: (id) => <span>{id.slice(0, 8)}...</span>,
    },
    {
      title: "Người mua",
      dataIndex: ["user", "username"],
      render: (username) => username || "Ẩn danh",
    },
    {
      title: "Shop",
      dataIndex: ["shop", "shopName"],
      render: (shopName, record) => shopName || `Shop ${record.shopId?.slice(0, 8)}`,
    },
    {
      title: "Sản phẩm",
      dataIndex: "orderItems",
      render: (items) => {
        if (!items || items.length === 0) return "Không có sản phẩm";
        const firstItem = items[0];
        const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        return `${firstItem.productName} +${items.length - 1} sản phẩm khác (${totalItems} sp)`;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method) => <Tag color="blue">{method?.toUpperCase() || "N/A"}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
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
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shippingAddress",
      render: (address) => {
        if (!address) return "Không có địa chỉ";
        return address.length > 50 ? `${address.substring(0, 50)}...` : address;
      },
    },
    {
      title: "Hành động",
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
            style={{ width: 140 }}
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
        pagination={{ pageSize: 10, showQuickJumper: true }}
      />

      {/* Modal chi tiết */}
      <Modal
        title={`Chi tiết đơn hàng ${
          selectedOrder?.orderId.slice(0, 8) || ""
        }`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>Thông tin đơn hàng</h4>
              <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderId}</p>
              <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>
              <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
              <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</p>
              {selectedOrder.shop && (
                <p><strong>Shop:</strong> {selectedOrder.shop.shopName}</p>
              )}
              {selectedOrder.user && (
                <p><strong>Khách hàng:</strong> {selectedOrder.user.username}</p>
              )}
              {selectedOrder.shippingAddress && (
                <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.shippingAddress}</p>
              )}
            </div>
            
            <div>
              <h4>Danh sách sản phẩm</h4>
              {selectedOrder.orderItems?.length ? (
                <Table
                  rowKey={(item) => item.productName + item.quantity}
                  dataSource={selectedOrder.orderItems}
                  pagination={false}
                  columns={[
                    { title: "Sản phẩm", dataIndex: "productName" },
                    { title: "Số lượng", dataIndex: "quantity", align: "center" },
                    {
                      title: "Giá",
                      dataIndex: "price",
                      render: (val) =>
                        val.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }),
                    },
                    {
                      title: "Thành tiền",
                      render: (_, record) =>
                        (record.price * record.quantity).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }),
                    },
                  ]}
                />
              ) : (
                <p>Không có sản phẩm nào trong đơn</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default OrderManager;

