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
  Upload,
  InputNumber
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

  // Handle image upload similar to the first component
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://localhost:7040/api/product/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setImageUrls((prev) => [...prev, res.data.imageUrl]);
      message.success("Ảnh đã tải lên");
    } catch {
      message.error("Tải ảnh thất bại");
    }
    return false;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageUrls(product.imageUrls || []);


    editForm.setFieldsValue({
      productName: product.productName,
      description: product.description,
      originalPrice: product.originalPrice,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
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
    });

    // Set subcategories based on selected category
    const selectedCategory = product.categoryId;
    if (selectedCategory) {
      setSubcategories(categories.filter((c) => c.parentCategoryId === selectedCategory));
    }

    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editingProduct) return;

      const payload = {
        ...values,
        imageUrls,
        variants: (values.variants || []).map((v: any) => ({
          ...v,
          colorCode: v.colorName?.toLowerCase().replace(/\s+/g, "-"),
          price: v.price || values.originalPrice,
          features: v.features || "",
          seoDescription: v.seoDescription || "",
        })),
        shopId: editingProduct.shopId,
      };

      await axios.put(
        `https://localhost:7040/api/product/${editingProduct.productId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Cập nhật sản phẩm thành công');
      setIsEditModalOpen(false);
      editForm.resetFields();
      setEditingProduct(null);
      setImageUrls([]);
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

      {/* Modal edit product - Updated to match first component logic */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setEditingProduct(null);
          setImageUrls([]);
        }}
        onOk={handleSaveEdit}
        width={900}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="productName"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá gốc"
                name="originalPrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập giá gốc"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục chính"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  onChange={(value) => {
                    editForm.setFieldsValue({ subcategoryId: undefined });
                    setSubcategories(categories.filter((c) => c.parentCategoryId === value));
                  }}
                >
                  {parentCategories.map((c) => (
                    <Select.Option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subcategoryId"
                label="Danh mục phụ"
                rules={[{ required: true, message: "Vui lòng chọn danh mục phụ" }]}
              >
                <Select placeholder="Chọn danh mục phụ" disabled={!subcategories.length}>
                  {subcategories.map((s) => (
                    <Select.Option key={s.categoryId} value={s.categoryId}>
                      {s.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm">
            <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={url}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
                    alt={`Product ${i + 1}`}
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={() => setImageUrls(prev => prev.filter((_, index) => index !== i))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Form.Item>

          <Divider>Biến thể sản phẩm</Divider>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, "size"]} label="Size">
                          <Input placeholder="S, M, L..." />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, "colorName"]} label="Màu sắc">
                          <Input placeholder="Đỏ, Xanh..." />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, "stockQuantity"]} label="Tồn kho">
                          <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, "price"]} label="Giá bán">
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Giá bán"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...rest} name={[name, "brandNew"]} label="Hàng mới" initialValue={true}>
                          <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label=" ">
                          <Button danger onClick={() => remove(name)} block>
                            Xóa
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...rest} name={[name, "features"]} label="Tính năng">
                          <Input placeholder="Tính năng đặc biệt..." />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...rest} name={[name, "seoDescription"]} label="Mô tả SEO">
                          <Input placeholder="Mô tả cho SEO..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({
                    size: '',
                    colorCode: '#000000',
                    colorName: '',
                    stockQuantity: 0,
                    price: 0,
                    brandNew: true,
                    features: '',
                    seoDescription: ''
                  })}
                  block
                  icon={<PlusOutlined />}
                >
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