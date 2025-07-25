import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Space,
  Tag,
  Tooltip,
  Modal,
} from 'antd';
import {
  ShopOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import axios from 'axios';

interface ShopResponseDto {
  shopId: string;
  name: string;
  sellerId: string;
  description: string;
  contactPhone: string;
  logoUrl: string;
  bannerUrl: string;
  isActive: boolean;
  createdAt: string;
}

const SellerShopManager: React.FC = () => {
  const [shop, setShop] = useState<ShopResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [form] = Form.useForm();
  const token = localStorage.getItem("authToken");

  // Gộp fetch seller và shop
  const fetchShopData = async () => {
    try {
      setLoading(true);
      const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      if (!seller?.sellerId) return message.error("Không tìm thấy thông tin seller!");

      const shopRes = await axios.get(`https://localhost:7040/api/shop/seller/${seller.sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = shopRes.data;
      if (!shopData?.shopId) return message.error("Seller chưa có cửa hàng!");

      setShop(shopData);
      form.setFieldsValue({
        name: shopData.name,
        description: shopData.description,
        contactPhone: shopData.contactPhone,
        logoUrl: shopData.logoUrl,
        bannerUrl: shopData.bannerUrl,
        isActive: shopData.isActive,
      });
    } catch (error) {
      console.error('Error loading shop data:', error);
      message.error('Không thể tải thông tin shop. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleEdit = () => setEditMode(true);

  const handleCancelEdit = () => {
    setEditMode(false);
    if (shop) {
      form.setFieldsValue({
        name: shop.name,
        description: shop.description,
        contactPhone: shop.contactPhone,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        isActive: shop.isActive,
      });
    }
  };

  const handleSave = async () => {
    if (!shop) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await axios.put(
        `https://localhost:7040/api/shop/${shop.shopId}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShop(res.data);
      setEditMode(false);
      message.success('Cập nhật thông tin shop thành công!');
    } catch (error) {
      console.error('Error updating shop:', error);
      message.error('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: UploadFile) => {
    if (!shop) return false;
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file as any);
      const res = await axios.post(
        `https://localhost:7040/api/shop/${shop.shopId}/upload-logo`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue({ logoUrl: res.data.logoUrl });
      if (!editMode) {
        const updateRes = await axios.put(
          `https://localhost:7040/api/shop/${shop.shopId}`,
          { logoUrl: res.data.logoUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShop(updateRes.data);
        message.success('Cập nhật logo thành công!');
      }
      return false;
    } catch (error) {
      console.error('Error uploading logo:', error);
      message.error('Không thể tải lên logo. Vui lòng thử lại.');
      return false;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: UploadFile) => {
    if (!shop) return false;
    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('file', file as any);
      const res = await axios.post(
        `https://localhost:7040/api/shop/${shop.shopId}/upload-banner`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      form.setFieldsValue({ bannerUrl: res.data.bannerUrl });
      if (!editMode) {
        const updateRes = await axios.put(
          `https://localhost:7040/api/shop/${shop.shopId}`,
          { bannerUrl: res.data.bannerUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShop(updateRes.data);
        message.success('Cập nhật banner thành công!');
      }
      return false;
    } catch (error) {
      console.error('Error uploading banner:', error);
      message.error('Không thể tải lên banner. Vui lòng thử lại.');
      return false;
    } finally {
      setUploadingBanner(false);
    }
  };

  const toggleShopStatus = async () => {
    if (!shop) return;
    try {
      const newStatus = !shop.isActive;
      const res = await axios.put(
        `https://localhost:7040/api/shop/${shop.shopId}`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShop(res.data);
      form.setFieldsValue({ isActive: newStatus });
      message.success(`Shop đã ${newStatus ? 'kích hoạt' : 'tạm ngưng'} thành công!`);
    } catch (error) {
      console.error('Error toggling shop status:', error);
      message.error('Không thể thay đổi trạng thái shop. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <Spin tip="Đang tải thông tin shop..." />
      </div>
    );
  }


  if (!shop) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <Card>
          <Space direction="vertical" align="center">
            <InfoCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>Không thể tải thông tin shop</h3>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchShopData}>
              Thử lại
            </Button>
          </Space>
        </Card>
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Quản lý Shop</h1>
                <p style={{ margin: 0, color: '#666' }}>Quản lý thông tin cửa hàng của bạn</p>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag
              color={shop.isActive ? 'green' : 'red'}
              icon={shop.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            >
              {shop.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Shop Information Card */}
      <Card style={{ borderRadius: 8, overflow: 'hidden' }}>
        {/* Banner Section */}
        <div style={{ position: 'relative', height: 192, background: 'linear-gradient(to right, #1890ff, #722ed1)' }}>
          <img
            src={editMode ? form.getFieldValue('bannerUrl') : shop.bannerUrl}
            alt="Shop banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleBannerUpload}
            style={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Button
              icon={uploadingBanner ? <Spin /> : <CameraOutlined />}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
            >
              {uploadingBanner ? 'Đang tải...' : 'Tải Banner'}
            </Button>
          </Upload>
        </div>

        {/* Shop Info */}
        <div style={{ padding: '24px' }}>
          <Row gutter={[24, 24]} align="bottom">
            {/* Logo */}
            <Col>
              <div style={{ position: 'relative', width: 128, height: 128, marginTop: -64 }}>
                <img
                  src={editMode ? form.getFieldValue('logoUrl') : shop.logoUrl}
                  alt={shop.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                />
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleLogoUpload}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.3s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  >
                    {uploadingLogo ? <Spin /> : <CameraOutlined style={{ color: '#fff', fontSize: 24 }} />}
                  </div>
                </Upload>
              </div>
            </Col>

            {/* Shop Details */}
            <Col flex="auto">
              {!editMode ? (
                <Space direction="vertical" size="middle">
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#000' }}>{shop.name}</h2>
                  <p style={{ color: '#666', margin: 0 }}>{shop.description}</p>
                  <Space direction="vertical" size="small" style={{ color: '#666', fontSize: 14 }}>
                    <div>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {shop.contactPhone}
                    </div>
                    <div>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Seller ID: {shop.sellerId}
                    </div>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Tạo lúc: {new Date(shop.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </Space>
                </Space>
              ) : null}
            </Col>

            {/* Action Buttons */}
            <Col>
              <Space direction="vertical">
                {!editMode ? (
                  <>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEdit}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      type={shop.isActive ? 'default' : 'primary'}
                      icon={shop.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={toggleShopStatus}
                      danger={shop.isActive}
                    >
                      {shop.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                    </Button>
                  </>
                ) : null}
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editMode}
        title={
          <Space>
            <ShopOutlined />
            Chỉnh sửa thông tin shop
          </Space>
        }
        onOk={handleSave}
        onCancel={handleCancelEdit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ loading: saving, icon: <SaveOutlined /> }}
        cancelButtonProps={{ icon: <CloseOutlined /> }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên shop"
            rules={[{ required: true, message: 'Tên shop không được để trống' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="Nhập tên shop..." />
          </Form.Item>
          <Form.Item
            name="contactPhone"
            label="Số điện thoại liên hệ"
            rules={[
              { required: true, message: 'Số điện thoại không được để trống' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả shop"
          >
            <Input.TextArea rows={4} placeholder="Mô tả về shop của bạn..." />
          </Form.Item>
          <Form.Item name="logoUrl" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="bannerUrl" hidden>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Additional Info */}
      <Card style={{ marginTop: 24, background: '#e6f7ff', borderColor: '#91d5ff' }}>
        <Space direction="vertical">
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span style={{ fontWeight: 500, color: '#1890ff' }}>Lưu ý quan trọng:</span>
          </Space>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#1890ff' }}>
            <li>Logo và banner sẽ được hiển thị trên trang shop của bạn</li>
            <li>Thông tin liên hệ sẽ được hiển thị cho khách hàng</li>
            <li>Khi tạm ngưng shop, khách hàng sẽ không thể đặt hàng</li>
            <li>Mọi thay đổi sẽ có hiệu lực ngay lập tức</li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};

export default SellerShopManager;