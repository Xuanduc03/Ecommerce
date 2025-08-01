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
  user?: {
    username: string;
    email?: string;
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Xử lý lọc
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchText ||
      order.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/${orderId}/status`,
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
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method) => <Tag color="blue">{method.toUpperCase()}</Tag>,
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
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên khách hoặc mã đơn"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
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
        <Col span={4} style={{ textAlign: "right" }}>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
            Tải lại
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
        width={600}
      >
        {selectedOrder?.orderItems?.length ? (
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
            ]}
          />
        ) : (
          <p>Không có sản phẩm nào trong đơn</p>
        )}
      </Modal>
    </Card>
  );
};

export default OrderManager;
