import { Layout, Menu, theme, Avatar, Badge, Dropdown, Space, Typography } from 'antd';
import React, { type ReactNode } from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
  BellOutlined,
  MailOutlined,
  LogoutOutlined,
  SettingOutlined,
  TagsOutlined,
  TagOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  children: ReactNode;
}
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    // Optional: redirect hoặc reload trang
    window.location.href = '/login';
  };
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/products',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '/admin/categories',
      icon: <TagsOutlined />,
      label: <Link to="/admin/categories">Categories</Link>,
    },
    {
      key: '/admin/orders',
      icon: <OrderedListOutlined />,
      label: <Link to="/admin/orders">Orders</Link>,
    },
    {
      key: '/admin/shops',
      icon: <OrderedListOutlined />,
      label: <Link to="/admin/shops">Shops</Link>,
    },
    {
      key: '/admin/sellers',
      icon: <ShopOutlined />,
      label: <Link to="/admin/sellers">Sellers</Link>,
    },
    {
      key: '/admin/discount',
      icon: <TagOutlined  />,
      label: <Link to="/admin/discount">Discount</Link>,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const onUserMenuClick = ({ key }: { key: string }) => {
    if (key === '3') handleLogout();
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        width={250}
        style={{
          background: colorBgContainer,
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        }}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div style={{
          padding: '24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <Space>
            <Avatar
              size="large"
              src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
            />
            <Text strong style={{ fontSize: '16px' }}>Admin Panel</Text>
          </Space>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            borderRight: 0,
            padding: '8px 0',
          }}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ flex: 1 }} />

          <Space size="large">
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>

            <Badge count={12} size="small">
              <MailOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="default"
                  src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
                />
                <Text>Admin</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;