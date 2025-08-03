import React, { useState, type ReactNode } from 'react';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Space,
  Dropdown,
  Avatar,
  FloatButton,
  theme
} from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TruckOutlined,
  FileTextOutlined,
  BoxPlotOutlined,
  SoundOutlined,
  DatabaseOutlined,
  PlusOutlined,
  BarChartOutlined,
  RiseOutlined,
  WalletOutlined,
  DashboardFilled,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}
interface SellerLayoutProps {
  children: ReactNode;
}
const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const [selectedKey, setSelectedKey] = useState<string>('dashboard');
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardFilled />,
      label: 'Trang chủ',
      children: [
        { key: '/seller', icon: null, label: 'Trang chủ' },
      ]
    },
    {
      key: 'order',
      icon: <FileTextOutlined />,
      label: 'Đơn hàng',
      children: [
        { key: "/seller/orders", icon: null, label: 'Đơn hàng của tôi' },
      ]
    },
    {
      key: 'product',
      icon: <BoxPlotOutlined />,
      label: 'Sản phẩm',
      children: [
        { key: '/seller/products', icon: null, label: 'Sản phẩm của tôi' },
        { key: "/seller/product/add", icon: null, label: 'Thêm sản phẩm mới' },
        { key: '/seller/product/reviews', icon: null, label: 'Xem các đánh giá' }
      ]
    },
    {
      key: 'shop',
      icon: <RiseOutlined />,
      label: 'Trung tâm Shop',
      children: [
        { key: '/seller/shop', icon: null, label: 'Trung tâm Shop' },
        { key: 'shopee-ads', icon: null, label: 'Quảng cáo Shopee' }
      ]
    },
    {
      key: 'finance',
      icon: <WalletOutlined />,
      label: 'Tài chính',
      children: [
        { key: '/seller/wallet', icon: null, label: 'Thu nhập của tôi' },
        { key: 'my-balance', icon: null, label: 'Số dư của tôi' },
        { key: 'bank-accounts', icon: null, label: 'Tài khoản ngân hàng' }
      ]
    }
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">Hồ sơ</Menu.Item>
      <Menu.Item key="settings">Cài đặt</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>Đăng xuất</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#ee4d2d',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNOCA4SDE2TDI0IDI0SDE2TDggOFoiIGZpbGw9IiNlZTRkMmQiLz4KPC9zdmc+"
            alt="Shopee"
            style={{ width: 32, height: 32, marginRight: 12 }}
          />
          <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
            Trung tâm Người bán 
          </Title>
        </div>
        <Space>
          <Button type="text" icon={<SearchOutlined />} style={{ color: 'white' }} />
          <Button type="text" icon={<QuestionCircleOutlined />} style={{ color: 'white' }} />
          <Button type="text" icon={<BellOutlined />} style={{ color: 'white' }} />
          <Dropdown overlay={userMenu} placement="bottomRight" >
            <Button type="text" style={{ color: 'white' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>prostorogh</span>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
              setSelectedKey(key);
            }}
          />

        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#f0f2f5', minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Layout>

      {/* Floating Action Buttons */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<SettingOutlined />}
      >
        <FloatButton icon={<MessageOutlined />} tooltip="Chat" />
        <FloatButton icon={<PlusOutlined />} tooltip="Thêm sản phẩm" />
        <FloatButton icon={<BarChartOutlined />} tooltip="Thống kê" />
      </FloatButton.Group>

      {/* Chat Button */}
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 24, bottom: 100 }}
        badge={{ count: 5 }}
      />
    </Layout>
  );
};

export default SellerLayout;