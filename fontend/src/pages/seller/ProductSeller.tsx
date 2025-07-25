import React, { useState, useMemo, useEffect } from 'react';
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
  Card,
  Row,
  Col,
  Typography,
  Badge,
  Divider,
  Modal,
  message,
  Form,
  Popconfirm,
  Upload
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
  ImportOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Title, Text } = Typography;

// BE DTO mapping
interface ProductVariant {
  size: string;
  colorCode: string;
  colorName: string;
  stockQuantity: number;
  price: number;
  brandNew: boolean;
  features: string;
  seoDescription: string;
}

interface Product {
  productId: string;
  productName: string;
  description?: string;
  originalPrice: number;
  shopId: string;
  categoryId: string;
  subcategoryId: string;
  imageUrls: string[];
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
  totalSold?: number;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'violation';
}

interface FilterState {
  search: string;
  status: string;
  category: string;
  stockStatus: string;
}

const statusOptions = [
  { value: 'active', label: 'Đang bán', color: 'green' },
  { value: 'inactive', label: 'Ngừng bán', color: 'orange' },
  { value: 'out_of_stock', label: 'Hết hàng', color: 'red' },
  { value: 'violation', label: 'Vi phạm', color: 'magenta' }
];

const stockStatusOptions = [
  { value: 'in_stock', label: 'Còn hàng' },
  { value: 'out_of_stock', label: 'Hết hàng' }
];


const ProductSeller: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
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
  const [shopId, setShopId] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  // Fetch shopId của seller
  const fetchShopForSeller = async () => {
    try {
      const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      if (!seller?.sellerId) return message.error("Không tìm thấy thông tin seller!");

      const shopRes = await axios.get(`https://localhost:7040/api/shop/seller/${seller.sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = shopRes.data;
      if (!shop?.shopId) return message.error("Seller chưa có cửa hàng!");

      setShopId(shop.shopId);
      console.log("shop", shop.shopId);
    } catch {
      message.error("Không thể tải thông tin Shop cho seller!");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("https://localhost:7040/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data || [];
      setCategories(all);
      setParentCategories(all.filter((c: any) => !c.parentCategoryId));
    } catch {
      message.error("Không tải được danh mục");
    }
  };

  const fetchProducts = async (shopId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://localhost:7040/api/product/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
      console.log("product", res.data)
    } catch {
      message.error("Không thể tải sản phẩm cho shop!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchShopForSeller();
  }, []);

  useEffect(() => {
    if (shopId) fetchProducts(shopId);
  }, [shopId]);


  // Thêm biến thể mới
  const addVariant = () => {
  const current = editForm.getFieldValue('variants') || [];
  editForm.setFieldsValue({
    variants: [
      ...current,
      { 
        size: '', 
        colorCode: '#000000', 
        colorName: '', 
        stockQuantity: 0, 
        price: 0, 
        brandNew: true,
        features: '',
        seoDescription: '' 
      }
    ]
  });
};

  // Xóa biến thể theo index
  const removeVariant = (index: number) => {
    const current = editForm.getFieldValue('variants') || [];
    if (current.length > index) {
      current.splice(index, 1);
      editForm.setFieldsValue({ variants: [...current] });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    // Tìm category và subcategory names từ ID
    const category = categories.find(c => c.categoryId === product.categoryId);
    const subcategory = categories.find(c => c.categoryId === product.subcategoryId);

    editForm.setFieldsValue({
      productName: product.productName,
      description: product.description,
      originalPrice: product.originalPrice,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      // Load variants data vào form
      variants: product.variants.map(variant => ({
        size: variant.size,
        colorCode: variant.colorCode,
        colorName: variant.colorName,
        stockQuantity: variant.stockQuantity,
        price: variant.price,
        brandNew: variant.brandNew,
        features: variant.features,
        seoDescription: variant.seoDescription,
      })),
      // Xử lý imageUrls cho Upload component
      imageUrls: product.imageUrls.map((url, index) => ({
        uid: `${index}`,
        name: `image_${index}.jpg`,
        status: 'done',
        url: url,
      })),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editingProduct) return;

      // Xử lý imageUrls từ Upload component
      const imageUrls = values.imageUrls?.map((file: any) => {
        if (file.url) return file.url; // existing images
        if (file.response?.url) return file.response.url; // newly uploaded
        return file.thumbUrl || file.preview; // fallback
      }).filter(Boolean) || [];

      // Xử lý variants data
      const variants = values.variants?.map((variant: any) => ({
        size: variant.size,
        colorCode: variant.colorCode || '#000000',
        colorName: variant.colorName,
        stockQuantity: parseInt(variant.stockQuantity) || 0,
        price: parseFloat(variant.price) || 0,
        brandNew: variant.brandNew ?? true,
        features: variant.features || '',
        seoDescription: variant.seoDescription || '',
      })) || [];

      const updateData = {
        productName: values.productName,
        description: values.description,
        originalPrice: parseFloat(values.originalPrice),
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        imageUrls,
        variants,
        shopId: editingProduct.shopId, // keep existing shopId
      };

      await axios.put(
        `https://localhost:7040/api/product/${editingProduct.productId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Cập nhật sản phẩm thành công');
      setIsEditModalOpen(false);
      editForm.resetFields();
      setEditingProduct(null);
      if (shopId) fetchProducts(shopId);
    } catch (error: any) {
      console.error('Update error:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
    }
  };
  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.search) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.categoryId === filters.category);
    }
    if (filters.stockStatus) {
      if (filters.stockStatus === 'in_stock') {
        filtered = filtered.filter(p =>
          p.variants.some(v => v.stockQuantity > 0)
        );
      } else if (filters.stockStatus === 'out_of_stock') {
        filtered = filtered.filter(p =>
          p.variants.every(v => v.stockQuantity === 0)
        );
      }
    }

    return filtered;
  }, [products, filters]);

  const getTotalStock = (variants: ProductVariant[]) =>
    variants.reduce((total, v) => total + v.stockQuantity, 0);

  const getPriceRange = (variants: ProductVariant[]) => {
    if (variants.length === 0) return { min: 0, max: 0 };
    const prices = variants.map(v => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);


  const handleHide = (product: Product) => {
    Modal.confirm({
      title: 'Ẩn sản phẩm',
      content: `Bạn có chắc muốn ẩn "${product.productName}"?`,
      okText: 'Ẩn',
      cancelText: 'Hủy',
      onOk: () => message.success('Đã ẩn sản phẩm')
    });
  };

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
        label: product.status === 'active' ? 'Ẩn sản phẩm' : 'Hiển thị',
        icon: <EyeInvisibleOutlined />,
        onClick: () => handleHide(product)
      }
    ]
  });

  const columns: ColumnsType<Product> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, p) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Image
            src={p.imageUrls?.[0] || 'https://via.placeholder.com/60'}
            alt={p.productName}
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
          <div>
            <Tooltip title={p.productName}>
              <div style={{
                fontWeight: 500,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {p.productName}
              </div>
            </Tooltip>
          </div>
        </div>
      )
    },
    {
      title: 'Biến thể',
      key: 'variants',
      width: 200,
      render: (_, p) => (
        <div>
          {p.variants.slice(0, 2).map((v, i) => (
            <Text key={i} style={{ fontSize: 12, display: 'block' }}>
              {`${v.size} - ${v.colorName}`}
            </Text>
          ))}
          {p.variants.length > 2 && (
            <Text style={{ color: '#1890ff', fontSize: 12 }}>
              +{p.variants.length - 2} biến thể khác
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Giá',
      key: 'price',
      width: 120,
      render: (_, p) => {
        const { min, max } = getPriceRange(p.variants);
        return (
          <Text strong style={{ color: '#ee4d2d' }}>
            {min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`}
          </Text>
        );
      }
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (_, p) => {
        const stock = getTotalStock(p.variants);
        return (
          <Badge count={stock} showZero overflowCount={999}
            style={{ backgroundColor: stock > 0 ? '#52c41a' : '#ff4d4f' }} />
        );
      }
    },
    {
      title: 'Đã bán',
      key: 'sold',
      width: 80,
      align: 'center',
      render: (_, p) => (
        <Text strong style={{ color: '#1890ff' }}>{p.totalSold || 0}</Text>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, p) => {
        const s = statusOptions.find(s => s.value === p.status);
        return <Tag color={s?.color}>{s?.label || 'N/A'}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_, p) => (
        <Dropdown menu={getActionMenu(p)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const handleResetFilters = () =>
    setFilters({ search: '', status: '', category: '', stockStatus: '' });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý sản phẩm</Title>
          <Text type="secondary">Tổng số sản phẩm: {filteredProducts.length}</Text>
        </div>

        {/* Toolbar */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Select placeholder="Trạng thái" value={filters.status || undefined}
                onChange={v => setFilters({ ...filters, status: v || '' })} allowClear style={{ width: '100%' }}>
                {statusOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Select placeholder="Tình trạng kho" value={filters.stockStatus || undefined}
                onChange={v => setFilters({ ...filters, stockStatus: v || '' })} allowClear style={{ width: '100%' }}>
                {stockStatusOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Space>
                <Button icon={<FilterOutlined />} onClick={handleResetFilters}>Đặt lại</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Thêm sản phẩm')}>
                  Thêm sản phẩm
                </Button>
              </Space>
            </Col>
          </Row>
          <Divider style={{ margin: '16px 0' }} />
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button icon={<ExportOutlined />} size="small">Xuất Excel</Button>
                <Button icon={<ImportOutlined />} size="small">Nhập Excel</Button>
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>Hiển thị {filteredProducts.length} sản phẩm</Text>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="productId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredProducts.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
            onChange: (page, size) => setPagination({ ...pagination, current: page, pageSize: size || 10 })
          }}
          scroll={{ x: 1000 }}
          size="small"
          style={{ backgroundColor: '#fff', borderRadius: 6 }}
        />
      </Card>

      {/* modal edit product */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleSaveEdit}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={editForm} initialValues={{ variants: [] }}>
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Giá gốc"
            name="originalPrice"
            rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Chọn danh mục' }]}>
            <Select>
              {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Danh mục con" name="subcategoryId" rules={[{ required: true, message: 'Chọn danh mục con' }]}>
            <Select>
              {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>


          <Form.Item label="Ảnh sản phẩm" name="imageUrls" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Upload listType="picture-card" beforeUpload={() => false} multiple>
              <div>
                <UploadOutlined /> Upload
              </div>
            </Upload>
          </Form.Item>

          <Divider>Biến thể</Divider>
          <Form.List name="variants">
            {(fields) => (
              <>
                {fields.map(({ key, name }) => (
                  <Row key={key} gutter={8} style={{ marginBottom: 8, alignItems: 'center' }}>
                    <Col span={4}>
                      <Form.Item name={[name, 'size']} rules={[{ required: true }]} noStyle>
                        <Input placeholder="Size" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item name={[name, 'colorName']} rules={[{ required: true }]} noStyle>
                        <Input placeholder="Màu" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item name={[name, 'stockQuantity']} rules={[{ required: true }]} noStyle>
                        <Input type="number" placeholder="Tồn kho" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item name={[name, 'price']} rules={[{ required: true }]} noStyle>
                        <Input type="number" placeholder="Giá" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={[name, 'seoDescription']} noStyle>
                        <Input placeholder="SEO Description" />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right' }}>
                      <Popconfirm title="Xóa biến thể?" onConfirm={() => removeVariant(name)}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" icon={<PlusCircleOutlined />} onClick={addVariant} block>
                  Thêm biến thể
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>


    </div>
  );
};

export default ProductSeller;
