import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Upload,
  Space,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
  ShopOutlined,
  PhoneOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ShopDto {
  shopId: string;
  sellerId: string;
  name: string;
  contactPhone: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface CreateShopDto {
  sellerId: string;
  name: string;
  contactPhone: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
}

interface UpdateShopDto {
  shopId: string;
  name: string;
  contactPhone: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
}

interface FilterState {
  searchText: string;
  status: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  sellerId: string;
}

const ShopManagement: React.FC = () => {
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShop, setCurrentShop] = useState<ShopDto | null>(null);
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    status: '',
    dateRange: null,
    sellerId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const token = localStorage.getItem('authToken');


  const fetchSellers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Vui lòng đăng nhập lại.');

      const { data } = await axios.get('https://localhost:7040/api/admin/sellers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSellers(Array.isArray(data.items) ? data.items : []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách seller');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    let result = [...shops];

    // Search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(shop =>
        shop.name.toLowerCase().includes(searchLower) ||
        shop.sellerId.toLowerCase().includes(searchLower) ||
        shop.contactPhone.includes(searchLower) ||
        shop.shopId.toLowerCase().includes(searchLower) ||
        (shop.description && shop.description.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter(shop => shop.status === filters.status);
    }

    // Seller ID filter
    if (filters.sellerId) {
      result = result.filter(shop =>
        shop.sellerId.toLowerCase().includes(filters.sellerId.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      result = result.filter(shop => {
        if (!shop.createdAt) return false;
        const createdDate = dayjs(shop.createdAt);
        return createdDate.isAfter(filters.dateRange![0]) &&
          createdDate.isBefore(filters.dateRange![1]);
      });
    }

    return result;
  }, [shops, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = shops.length;
    const active = shops.filter(shop => shop.status === 'active').length;
    const inactive = shops.filter(shop => shop.status === 'inactive').length;
    const pending = shops.filter(shop => shop.status === 'pending').length;

    return { total, active, inactive, pending };
  }, [shops]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7040/api/shop', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shopData = response.data.map((shop: any) => ({
        shopId: shop.shopId || shop.id,
        sellerId: shop.sellerId,
        name: shop.name,
        contactPhone: shop.contactPhone,
        description: shop.description,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
        status: shop.status || 'active', // Default status
      }));

      setShops(shopData);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchShops();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentShop(null);
    setLogoUrl('');
    setBannerUrl('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (shop: ShopDto) => {
    setIsEditing(true);
    setCurrentShop(shop);
    setLogoUrl(shop.logoUrl);
    setBannerUrl(shop.bannerUrl);
    form.setFieldsValue({
      sellerId: shop.sellerId,
      name: shop.name,
      contactPhone: shop.contactPhone,
      description: shop.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (shopId: string) => {
    try {
      await axios.delete(`https://localhost:7040/api/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Xóa cửa hàng thành công');
      fetchShops();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa cửa hàng');
    }
  };


 const handleUpload = async (file: any, imageType: 'logo' | 'banner') => {
  const shopId = isEditing && currentShop ? currentShop.shopId : '00000000-0000-0000-0000-000000000000';
  const formData = new FormData();

  // Tên key phải đúng với model bên server
  formData.append('File', file);           
  formData.append('ShopId', shopId);       
  formData.append('ImageType', imageType); 

  try {
    const response = await axios.post('https://localhost:7040/api/shop/upload-image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const url = response.data[`${imageType}Url`];
    if (imageType === 'logo') {
      setLogoUrl(url);
    } else {
      setBannerUrl(url);
    }
    message.success(`Tải ${imageType === 'logo' ? 'logo' : 'banner'} thành công`);
    return false;
  } catch (error: any) {
    console.error('Upload error:', error.response?.data);
    message.error(error.response?.data?.message || `Lỗi khi tải ${imageType === 'logo' ? 'logo' : 'banner'}`);
    return false;
  }
};


  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateShopDto | UpdateShopDto = {
        sellerId: values.sellerId,
        name: values.name,
        contactPhone: values.contactPhone,
        description: values.description,
        logoUrl: logoUrl || '',
        bannerUrl: bannerUrl || '',
        ...(isEditing && { shopId: currentShop?.shopId }),
      };

      if (isEditing && currentShop) {
        await axios.put(`https://localhost:7040/api/shop/${currentShop.shopId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Cập nhật cửa hàng thành công');
      } else {
        await axios.post('https://localhost:7040/api/shop', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Tạo cửa hàng thành công');
      }
      setIsModalVisible(false);
      setLogoUrl('');
      setBannerUrl('');
      form.resetFields();
      fetchShops();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu cửa hàng');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setLogoUrl('');
    setBannerUrl('');
    form.resetFields();
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      dateRange: null,
      sellerId: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Ngừng hoạt động';
      case 'pending': return 'Chờ duyệt';
      default: return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shopId',
      key: 'shopId',
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {text.substring(0, 8)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: string, record: ShopDto) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.logoUrl && (
            <img
              src={record.logoUrl}
              alt="Logo"
              style={{
                width: 32,
                height: 32,
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Tag color={getStatusColor(record.status || 'active')}>
              {getStatusText(record.status || 'active')}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Seller',
      dataIndex: 'sellerId',
      key: 'sellerId',
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Tag icon={<UserOutlined />} color="blue">
            {text.substring(0, 8)}...
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Liên hệ',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          {text || <span style={{ color: '#ccc' }}>Chưa có mô tả</span>}
        </Tooltip>
      ),
    },
    {
      title: 'Hình ảnh',
      key: 'images',
      width: 120,
      render: (_: any, record: ShopDto) => (
        <Space>
          {record.logoUrl && (
            <Tooltip title="Xem logo">
              <a href={record.logoUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={record.logoUrl}
                  alt="Logo"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9'
                  }}
                />
              </a>
            </Tooltip>
          )}
          {record.bannerUrl && (
            <Tooltip title="Xem banner">
              <a href={record.bannerUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={record.bannerUrl}
                  alt="Banner"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9'
                  }}
                />
              </a>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : 'N/A',
      sorter: (a: ShopDto, b: ShopDto) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: ShopDto) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: 'Thông tin chi tiết cửa hàng',
                  width: 600,
                  content: (
                    <div style={{ marginTop: 16 }}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div><strong>ID:</strong> {record.shopId}</div>
                        <div><strong>Tên:</strong> {record.name}</div>
                        <div><strong>Seller ID:</strong> {record.sellerId}</div>
                        <div><strong>Số điện thoại:</strong> {record.contactPhone}</div>
                        <div><strong>Mô tả:</strong> {record.description || 'Chưa có mô tả'}</div>
                        <div><strong>Trạng thái:</strong>
                          <Tag color={getStatusColor(record.status || 'active')} style={{ marginLeft: 8 }}>
                            {getStatusText(record.status || 'active')}
                          </Tag>
                        </div>
                        {record.createdAt && (
                          <div><strong>Ngày tạo:</strong> {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                        )}
                        {record.logoUrl && (
                          <div>
                            <strong>Logo:</strong>
                            <br />
                            <img src={record.logoUrl} alt="Logo" style={{ maxWidth: 200, marginTop: 8 }} />
                          </div>
                        )}
                        {record.bannerUrl && (
                          <div>
                            <strong>Banner:</strong>
                            <br />
                            <img src={record.bannerUrl} alt="Banner" style={{ maxWidth: 200, marginTop: 8 }} />
                          </div>
                        )}
                      </Space>
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa cửa hàng"
            description="Bạn có chắc muốn xóa cửa hàng này không?"
            onConfirm={() => handleDelete(record.shopId)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: 24 }}>Quản lý cửa hàng</h1>
                <p style={{ margin: 0, color: '#666' }}>
                  Quản lý thông tin các cửa hàng trong hệ thống
                </p>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchShops}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="large"
              >
                Thêm cửa hàng
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
              <div>Tổng cửa hàng</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {stats.active}
              </div>
              <div>Đang hoạt động</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.pending}
              </div>
              <div>Chờ duyệt</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                {stats.inactive}
              </div>
              <div>Ngừng hoạt động</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Tìm kiếm theo tên, ID, SĐT..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              />
            </Col>
            <Col xs={24} sm={16}>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                  type={showFilters ? 'primary' : 'default'}
                >
                  Bộ lọc {Object.values(filters).some(v => v && v !== '') &&
                    <Badge count={Object.values(filters).filter(v => v && v !== '').length} />
                  }
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  disabled={!Object.values(filters).some(v => v && v !== '')}
                >
                  Xóa lọc
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('Tính năng xuất dữ liệu đang phát triển')}
                >
                  Xuất Excel
                </Button>
              </Space>
            </Col>
          </Row>

          {showFilters && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={16}>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 8 }}>Trạng thái:</div>
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ width: '100%' }}
                    allowClear
                    value={filters.status || undefined}
                    onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                  >
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Ngừng hoạt động</Option>
                    <Option value="pending">Chờ duyệt</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ marginBottom: 8 }}>Seller ID:</div>
                  <Input
                    placeholder="Nhập Seller ID"
                    allowClear
                    value={filters.sellerId}
                    onChange={(e) => setFilters(prev => ({ ...prev, sellerId: e.target.value }))}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 8 }}>Ngày tạo:</div>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={filters.dateRange}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        setFilters(prev => ({ ...prev, dateRange: [dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs] }));
                      } else {
                        setFilters(prev => ({ ...prev, dateRange: null }));
                      }
                    }}
                    format="DD/MM/YYYY"
                  />
                </Col>
              </Row>
            </>
          )}
        </Space>
      </Card>

      {/* Results info */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>
            Hiển thị <strong>{filteredShops.length}</strong> / <strong>{shops.length}</strong> cửa hàng
          </span>
          {filteredShops.length !== shops.length && (
            <Tag color="blue">Đã lọc</Tag>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredShops}
          rowKey="shopId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            {isEditing ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
          </Space>
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy bỏ"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sellerId"
                label="Seller"
                rules={[{ required: true, message: 'Vui lòng chọn Seller' }]}
              >
                <Select
                  placeholder="Chọn Seller"
                  loading={loading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {sellers.map((seller) => (
                    <Option key={seller.sellerId} value={seller.sellerId}>
                      {seller.userFullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="Tên cửa hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
          >
            <Input prefix={<ShopOutlined />} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả cửa hàng"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả về cửa hàng..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Logo cửa hàng">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => handleUpload(file, 'logo')}
                >
                  <Button icon={<UploadOutlined />} block>
                    Tải lên Logo
                  </Button>
                </Upload>
                {logoUrl && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Banner cửa hàng">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => handleUpload(file, 'banner')}
                >
                  <Button icon={<UploadOutlined />} block>
                    Tải lên Banner
                  </Button>
                </Upload>
                {bannerUrl && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ShopManagement;