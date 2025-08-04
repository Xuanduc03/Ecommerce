import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Space,
  Dropdown,
  Avatar,
  FloatButton,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Alert,
  List,
  Spin
} from 'antd';
import {
  SettingOutlined,
  BoxPlotOutlined,
  BarChartOutlined,
  RiseOutlined,
  WalletOutlined,
  ShopOutlined,
  DollarOutlined,
  WarningOutlined,
  GiftOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface SellerStats {
  totalProducts: number;
  totalOrdersSold: number;
  todayRevenue: number;
  monthRevenue: number;
}
// Dashboard Component
const DashboardSeller: React.FC = () => {

  const [statistics, setStatistics] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerStatistics();
  }, []);

  const fetchSellerStatistics = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }

      // First get seller info to get sellerId
      const sellerResponse = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sellerId = sellerResponse.data?.sellerId;
      if (!sellerId) {
        console.error("No sellerId found");
        setLoading(false);
        return;
      }

      // Then get statistics using sellerId
      const statisticsResponse = await axios.get(`https://localhost:7040/api/statistics/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatistics(statisticsResponse.data);
    } catch (error) {
      console.error("Error fetching seller statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const shortcuts = [
    { key: 'my-products', label: 'Sản phẩm của tôi', icon: <BoxPlotOutlined />, color: '#1890ff' },
    { key: 'my-categories', label: 'Danh mục Shop', icon: <ShopOutlined />, color: '#52c41a' },
    { key: 'my-sales', label: 'Doanh số của tôi', icon: <BarChartOutlined />, color: '#fa8c16' },
    { key: 'marketing-center', label: 'Trung tâm Marketing', icon: <RiseOutlined />, color: '#13c2c2' },
    { key: 'my-income', label: 'Thu nhập của tôi', icon: <DollarOutlined />, color: '#722ed1' },
    { key: 'my-wallet', label: 'Ví của tôi', icon: <WalletOutlined />, color: '#eb2f96' },
    { key: 'business-insights', label: 'Thông tin kinh doanh', icon: <BarChartOutlined />, color: '#f5222d' },
    { key: 'shop-settings', label: 'Cài đặt Shop', icon: <SettingOutlined />, color: '#666' }
  ];

  const todoItems = [
    { label: 'Chưa thanh toán', value: 0, color: '#ff4d4f' },
    { label: 'Chờ xử lý vận chuyển', value: 1, color: '#fa8c16' },
    { label: 'Đã xử lý vận chuyển', value: 0, color: '#52c41a' },
    { label: 'Chờ trả hàng/Hoàn tiền', value: 15, color: '#1890ff' }
  ];

  const todoItems2 = [
    { label: 'Chờ hủy đơn', value: 0, color: '#ff4d4f' },
    { label: 'Sản phẩm bị cấm', value: 2, color: '#fa8c16' },
    { label: 'Sản phẩm hết hàng', value: 0, color: '#52c41a' },
    { label: 'Chờ chiến dịch', value: 0, color: '#1890ff', badge: true }
  ];

  const shopeeEvents = [
    {
      title: "Cuộc thi Người bán @ShopeeBestDeals",
      description: "Thắng gói quà 20.000.000₫ dành cho Người bán! 🎁 Để tham gia, chỉ cần Chia sẻ các deal tốt nhất của bạn trên Shopee Stories! Tham gia Cuộc thi Người bán @ShopeeBestDeals ngay! Từ 18/8 đến 24/8! Tìm hiểu thêm 👉",
      type: "competition",
      date: "Mới"
    },
    {
      title: "Chương trình Seller Spotlight",
      description: "Nhận được sự chú ý từ 27 triệu người theo dõi để có thêm đơn hàng và nhiều người theo dõi hơn thông qua Chương trình Seller Spotlight từ 3/8 đến 30/8! 🚀",
      type: "promo",
      date: "5 Tháng 8, 2024"
    }
  ];

  return (
    <>
      {/* Banner */}


      <Row gutter={[24, 24]}>
        <Col span={18}>
          {/* To Do List */}
          <Card title="Danh sách cần làm" style={{ marginBottom: 24 }}>
            <Text type="secondary">Những việc bạn cần xử lý</Text>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {todoItems.map((item, index) => (
                <Col span={6} key={index}>
                  <Card 
                    hoverable 
                    style={{ textAlign: 'center', border: `1px solid ${item.color}20` }}
                  >
                    <Statistic 
                      title={item.label} 
                      value={item.value} 
                      valueStyle={{ color: item.color, fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {todoItems2.map((item, index) => (
                <Col span={6} key={index}>
                  <Card 
                    hoverable 
                    style={{ textAlign: 'center', border: `1px solid ${item.color}20` }}
                  >
                    <Statistic 
                      title={item.label} 
                      value={item.value} 
                      valueStyle={{ color: item.color, fontSize: '32px', fontWeight: 'bold' }}
                    />
                    {item.badge && (
                      <Badge 
                        count="HOT" 
                        style={{ 
                          backgroundColor: '#ff4d4f',
                          position: 'absolute',
                          top: 8,
                          right: 8
                        }} 
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Business Insights */}
          <Card 
            title="Thông tin kinh doanh" 
            extra={
              <Button type="link" style={{ color: '#1890ff' }}>
                Xem thêm →
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <Text type="secondary">
              Dữ liệu thời gian thực đến GMT+7 13:00 | Tổng quan dữ liệu shop cho đơn hàng đã đặt
            </Text>
             {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Statistic 
                    title="Tổng sản phẩm" 
                    value={statistics?.totalProducts || 0} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="Đơn hàng đã bán" 
                    value={statistics?.totalOrdersSold || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="Doanh thu hôm nay" 
                    value={statistics?.todayRevenue || 0} 
                    suffix="đ"
                    precision={0}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="Doanh thu tháng này" 
                    value={statistics?.monthRevenue || 0} 
                    suffix="đ"
                    precision={0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            )}
          </Card>

          

          {/* Marketing Center */}
          <Card 
            title="Trung tâm Marketing" 
            extra={
              <Button type="link" style={{ color: '#1890ff' }}>
                Xem thêm →
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <Text type="secondary">Công cụ Marketing & Cơ chế Khuyến mãi</Text>
            <Alert
              message="Số dư quảng cáo của bạn đã giảm xuống 0.13₫ - vui lòng nạp thêm"
              type="warning"
              showIcon
              closable
              style={{ marginTop: 16 }}
              icon={<WarningOutlined />}
            />
          </Card>

          {/* Shopee Events */}
          <Card title="Sự kiện Shopee" style={{ marginBottom: 24 }}>
            <List
              dataSource={shopeeEvents}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.type === 'competition' ? <GiftOutlined /> : <StarOutlined />} 
                        style={{ backgroundColor: item.type === 'competition' ? '#52c41a' : '#1890ff' }}
                      />
                    }
                    title={
                      <div>
                        <Text strong>{item.title}</Text>
                        <Badge 
                          count={item.date} 
                          style={{ 
                            backgroundColor: item.date === 'Mới' ? '#f50' : '#108ee9',
                            marginLeft: 8
                          }} 
                        />
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={6}>
          {/* Shortcuts */}
          <Card title="Lối tắt" style={{ marginBottom: 24 }}>
            <Row gutter={[8, 8]}>
              {shortcuts.slice(0, 6).map((shortcut, index) => (
                <Col span={12} key={index}>
                  <Button
                    type="text"
                    style={{
                      width: '100%',
                      height: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: shortcut.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        marginBottom: '8px'
                      }}
                    >
                      {shortcut.icon}
                    </div>
                    <Text style={{ fontSize: '11px', textAlign: 'center' }}>
                      {shortcut.label}
                    </Text>
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Notifications */}
          <Card title="Thông báo" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Nhắc nhở dùng thử miễn phí"
                description="Còn lại 5 ngày dùng thử miễn phí Chương trình Miễn phí vận chuyển"
                type="info"
                showIcon
                style={{ fontSize: '12px' }}
              />
              <Alert
                message="Thông báo cuộc thi"
                description="Cuộc thi Người bán @ShopeeBestDeals - Thắng gói quà 20.000.000₫!"
                type="success"
                showIcon
                style={{ fontSize: '12px' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardSeller;