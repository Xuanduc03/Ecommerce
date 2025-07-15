import React, { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Image,
  Tooltip,
  Dropdown,
  Menu,
  Card,
  Row,
  Col,
  Typography,
  Badge,
  Avatar,
  Divider,
  Modal,
  message
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  DollarOutlined,
  MoreOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Option } = Select;
const { Title, Text } = Typography;

// Types
interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  variants: ProductVariant[];
  category: string;
  status: 'active' | 'inactive' | 'out_of_stock' | 'violation';
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  status: string;
  category: string;
  stockStatus: string;
}

const ProductSeller: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    stockStatus: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Mock data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Áo thun nam cổ tròn basic cotton 100% chất lượng cao, thoáng mát',
      image: 'https://via.placeholder.com/60x60/1890ff/ffffff?text=Áo',
      variants: [
        { id: '1-1', name: 'Size M, Màu Đen', price: 150000, stock: 50, sku: 'AT-M-DEN' },
        { id: '1-2', name: 'Size L, Màu Trắng', price: 150000, stock: 30, sku: 'AT-L-TRANG' },
        { id: '1-3', name: 'Size XL, Màu Xanh', price: 160000, stock: 20, sku: 'AT-XL-XANH' }
      ],
      category: 'Thời trang nam',
      status: 'active',
      totalSold: 245,
      createdAt: '2024-01-15',
      updatedAt: '2024-07-10'
    },
    {
      id: '2',
      name: 'Giày sneaker nữ đế cao su non chống trượt phong cách Hàn Quốc',
      image: 'https://via.placeholder.com/60x60/52c41a/ffffff?text=Giày',
      variants: [
        { id: '2-1', name: 'Size 36, Màu Hồng', price: 299000, stock: 15, sku: 'GS-36-HONG' },
        { id: '2-2', name: 'Size 37, Màu Đen', price: 299000, stock: 0, sku: 'GS-37-DEN' },
        { id: '2-3', name: 'Size 38, Màu Trắng', price: 320000, stock: 25, sku: 'GS-38-TRANG' }
      ],
      category: 'Giày dép nữ',
      status: 'active',
      totalSold: 89,
      createdAt: '2024-02-20',
      updatedAt: '2024-07-12'
    },
    {
      id: '3',
      name: 'Túi xách nữ da PU cao cấp size mini thời trang',
      image: 'https://via.placeholder.com/60x60/fa8c16/ffffff?text=Túi',
      variants: [
        { id: '3-1', name: 'Màu Nâu', price: 450000, stock: 0, sku: 'TX-NAU' },
        { id: '3-2', name: 'Màu Đen', price: 450000, stock: 0, sku: 'TX-DEN' }
      ],
      category: 'Túi ví nữ',
      status: 'out_of_stock',
      totalSold: 156,
      createdAt: '2024-03-10',
      updatedAt: '2024-07-11'
    },
    {
      id: '4',
      name: 'Điện thoại iPhone 15 Pro Max 256GB chính hãng VN/A',
      image: 'https://via.placeholder.com/60x60/722ed1/ffffff?text=Phone',
      variants: [
        { id: '4-1', name: 'Màu Titan Tự Nhiên', price: 32990000, stock: 5, sku: 'IP15-256-TN' },
        { id: '4-2', name: 'Màu Titan Xanh', price: 32990000, stock: 3, sku: 'IP15-256-TX' }
      ],
      category: 'Điện thoại',
      status: 'active',
      totalSold: 23,
      createdAt: '2024-04-01',
      updatedAt: '2024-07-13'
    },
    {
      id: '5',
      name: 'Sản phẩm vi phạm chính sách bán hàng',
      image: 'https://via.placeholder.com/60x60/ff4d4f/ffffff?text=!!!',
      variants: [
        { id: '5-1', name: 'Default', price: 100000, stock: 0, sku: 'VIOLATION' }
      ],
      category: 'Khác',
      status: 'violation',
      totalSold: 0,
      createdAt: '2024-05-01',
      updatedAt: '2024-07-14'
    }
  ];

  // Categories
  const categories = [
    'Thời trang nam',
    'Thời trang nữ',
    'Giày dép nam',
    'Giày dép nữ',
    'Túi ví nữ',
    'Điện thoại',
    'Laptop',
    'Khác'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Hiển thị', color: 'green' },
    { value: 'inactive', label: 'Ẩn', color: 'orange' },
    { value: 'out_of_stock', label: 'Hết hàng', color: 'red' },
    { value: 'violation', label: 'Vi phạm', color: 'red' }
  ];

  const stockStatusOptions = [
    { value: 'in_stock', label: 'Còn hàng' },
    { value: 'out_of_stock', label: 'Hết hàng' }
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Stock status filter
    if (filters.stockStatus) {
      if (filters.stockStatus === 'in_stock') {
        filtered = filtered.filter(product => 
          product.variants.some(variant => variant.stock > 0)
        );
      } else if (filters.stockStatus === 'out_of_stock') {
        filtered = filtered.filter(product => 
          product.variants.every(variant => variant.stock === 0)
        );
      }
    }

    return filtered;
  }, [filters]);

  // Calculate totals
  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getPriceRange = (variants: ProductVariant[]) => {
    if (variants.length === 0) return { min: 0, max: 0 };
    const prices = variants.map(v => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Action handlers
  const handleEdit = (product: Product) => {
    message.info(`Chỉnh sửa sản phẩm: ${product.name}`);
  };

  const handleHide = (product: Product) => {
    Modal.confirm({
      title: 'Ẩn sản phẩm',
      content: `Bạn có chắc muốn ẩn sản phẩm "${product.name}"?`,
      okText: 'Ẩn',
      cancelText: 'Hủy',
      onOk: () => {
        message.success('Đã ẩn sản phẩm');
      }
    });
  };

  const handleUpdatePrice = (product: Product) => {
    message.info(`Cập nhật giá sản phẩm: ${product.name}`);
  };

  const handleUpdateStock = (product: Product) => {
    message.info(`Cập nhật kho sản phẩm: ${product.name}`);
  };

  // Action menu for each product
  const getActionMenu = (product: Product): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: 'Chỉnh sửa',
        icon: <EditOutlined />,
        onClick: () => handleEdit(product)
      },
      {
        key: 'hide',
        label: product.status === 'active' ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm',
        icon: <EyeInvisibleOutlined />,
        onClick: () => handleHide(product)
      },
      {
        key: 'update-price',
        label: 'Cập nhật giá',
        icon: <DollarOutlined />,
        onClick: () => handleUpdatePrice(product)
      },
      {
        key: 'update-stock',
        label: 'Cập nhật kho',
        icon: <ReloadOutlined />,
        onClick: () => handleUpdateStock(product)
      }
    ]
  });

  // Table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, product) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Image
            src={product.image}
            alt={product.name}
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
          <div style={{ flex: 1 }}>
            <Tooltip title={product.name}>
              <div
                style={{
                  fontWeight: 500,
                  color: '#262626',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.4',
                  maxHeight: '2.8em'
                }}
              >
                {product.name}
              </div>
            </Tooltip>
            <div style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>
              SKU: {product.variants[0]?.sku || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Biến thể',
      key: 'variants',
      width: 200,
      render: (_, product) => (
        <div>
          {product.variants.slice(0, 2).map((variant, index) => (
            <div key={variant.id} style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#595959' }}>
                {variant.name}
              </Text>
            </div>
          ))}
          {product.variants.length > 2 && (
            <Text style={{ fontSize: 12, color: '#1890ff' }}>
              +{product.variants.length - 2} biến thể khác
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Giá',
      key: 'price',
      width: 120,
      render: (_, product) => {
        const { min, max } = getPriceRange(product.variants);
        return (
          <div>
            {min === max ? (
              <Text strong style={{ color: '#ee4d2d' }}>
                {formatPrice(min)}
              </Text>
            ) : (
              <Text strong style={{ color: '#ee4d2d' }}>
                {formatPrice(min)} - {formatPrice(max)}
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (_, product) => {
        const totalStock = getTotalStock(product.variants);
        return (
          <Badge
            count={totalStock}
            showZero
            overflowCount={999}
            style={{
              backgroundColor: totalStock > 0 ? '#52c41a' : '#ff4d4f'
            }}
          />
        );
      }
    },
    {
      title: 'Đã bán',
      key: 'sold',
      width: 80,
      align: 'center',
      render: (_, product) => (
        <Text strong style={{ color: '#1890ff' }}>
          {product.totalSold}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, product) => {
        const status = statusOptions.find(s => s.value === product.status);
        return (
          <Tag color={status?.color}>
            {status?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, product) => (
        <Dropdown menu={getActionMenu(product)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      stockStatus: ''
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý sản phẩm
          </Title>
          <Text type="secondary">
            Tổng số sản phẩm: {filteredProducts.length}
          </Text>
        </div>

        {/* Toolbar */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Select
                placeholder="Trạng thái"
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value || '' })}
                allowClear
                style={{ width: '100%' }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Select
                placeholder="Danh mục"
                value={filters.category || undefined}
                onChange={(value) => setFilters({ ...filters, category: value || '' })}
                allowClear
                style={{ width: '100%' }}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Select
                placeholder="Tình trạng kho"
                value={filters.stockStatus || undefined}
                onChange={(value) => setFilters({ ...filters, stockStatus: value || '' })}
                allowClear
                style={{ width: '100%' }}
              >
                {stockStatusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Space>
                <Button 
                  icon={<FilterOutlined />}
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => message.info('Thêm sản phẩm mới')}
                >
                  Thêm sản phẩm
                </Button>
              </Space>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* Additional Actions */}
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button icon={<ExportOutlined />} size="small">
                  Xuất Excel
                </Button>
                <Button icon={<ImportOutlined />} size="small">
                  Nhập Excel
                </Button>
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hiển thị {filteredProducts.length} sản phẩm
              </Text>
            </Col>
          </Row>
        </div>

        {/* Products Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredProducts.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
            onChange: (page, pageSize) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize || 10
              });
            }
          }}
          scroll={{ x: 1000 }}
          size="small"
          style={{ 
            backgroundColor: '#fff',
            borderRadius: 6
          }}
        />
      </Card>
    </div>
  );
};

export default ProductSeller;