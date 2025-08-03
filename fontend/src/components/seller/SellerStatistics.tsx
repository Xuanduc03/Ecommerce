import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';

interface SellerStatistics {
  totalProducts: number;
  totalSoldOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

const SellerStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<SellerStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId'); // Giả sử lưu userId trong localStorage
      
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await axios.get(`/api/statistics/seller/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatistics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Thống Kê Cửa Hàng</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Sản Phẩm"
              value={statistics?.totalProducts || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn Hàng Đã Bán"
              value={statistics?.totalSoldOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh Thu Hôm Nay"
              value={statistics?.todayRevenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh Thu Tháng"
              value={statistics?.monthlyRevenue || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SellerStatistics;