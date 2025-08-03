import React from 'react';
import { Card, Row, Col, Typography, Divider, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationProps {
  order: {
    orderId: string;
    createdAt: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    paymentMethod: string;
    status: string;
    totalAmount: number;
    items: OrderItem[];
  };
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getPaymentMethodText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      case 'vnpay':
        return 'VNPay';
      default:
        return method;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#52c41a' }}>
            <ShoppingOutlined style={{ marginRight: '8px' }} />
            Đặt Hàng Thành Công!
          </Title>
          <Text type="secondary">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.
          </Text>
        </div>

        <Divider />

        {/* Thông tin đơn hàng */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={4}>Thông Tin Đơn Hàng</Title>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong>Mã đơn hàng:</Text>
                <br />
                <Text code>{order.orderId.substring(0, 8).toUpperCase()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày đặt:</Text>
                <br />
                <Text>{formatDate(order.createdAt)}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 8]} style={{ marginTop: '8px' }}>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag color={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Phương thức thanh toán:</Text>
                <br />
                <Text>{getPaymentMethodText(order.paymentMethod)}</Text>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />

        {/* Thông tin người nhận */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={4}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Thông Tin Người Nhận
            </Title>
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text strong>
                    <UserOutlined style={{ marginRight: '4px' }} />
                    {order.recipientName}
                  </Text>
                </Col>
              </Row>
              <Row gutter={[16, 8]} style={{ marginTop: '8px' }}>
                <Col span={24}>
                  <Text>
                    <PhoneOutlined style={{ marginRight: '4px' }} />
                    {order.recipientPhone}
                  </Text>
                </Col>
              </Row>
              <Row gutter={[16, 8]} style={{ marginTop: '8px' }}>
                <Col span={24}>
                  <Text>
                    <EnvironmentOutlined style={{ marginRight: '4px' }} />
                    {order.recipientAddress}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Danh sách sản phẩm */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={4}>Sản Phẩm Đã Đặt</Title>
            {order.items.map((item, index) => (
              <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                <Row gutter={[16, 8]} align="middle">
                  <Col span={12}>
                    <Text strong>{item.productName}</Text>
                  </Col>
                  <Col span={4}>
                    <Text>Số lượng: {item.quantity}</Text>
                  </Col>
                  <Col span={4}>
                    <Text>Giá: {formatCurrency(item.price)}</Text>
                  </Col>
                  <Col span={4}>
                    <Text strong>Thành tiền: {formatCurrency(item.price * item.quantity)}</Text>
                  </Col>
                </Row>
              </Card>
            ))}
          </Col>
        </Row>

        <Divider />

        {/* Tổng tiền */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ textAlign: 'right' }}>
              <Title level={3}>
                Tổng tiền: <span style={{ color: '#1890ff' }}>{formatCurrency(order.totalAmount)}</span>
              </Title>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Lưu ý */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small" style={{ backgroundColor: '#fff7e6', borderColor: '#ffd591' }}>
              <Title level={5} style={{ color: '#d46b08' }}>
                Lưu ý quan trọng:
              </Title>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Đơn hàng sẽ được xử lý trong vòng 24 giờ</li>
                <li>Bạn sẽ nhận được thông báo khi đơn hàng được giao</li>
                <li>Nếu có thắc mắc, vui lòng liên hệ hotline: 1900-xxxx</li>
                <li>Bạn có thể theo dõi trạng thái đơn hàng trong phần "Quản lý đơn hàng"</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default OrderConfirmation;