import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Input,
  Space,
  Select,
  Modal,
  Form,
  message,
  InputNumber,
  Divider,
  Tag,
  Upload,
  Badge,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  ClearOutlined,
  FilterOutlined,
  DownloadOutlined,
  ShopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProductVariant {
  size: string;
  colorCode: string;
  colorName: string;
  stockQuantity: number;
  brandNew: boolean;
  features: string;
  seoDescription: string;
  price: number;
}

interface Product {
  key: string;
  productId: string;
  productName: string;
  description: string;
  originalPrice: number;
  price: number;
  categoryId: string;
  categoryName?: string;
  subcategoryId: string;
  subcategoryName?: string;
  shopId?: string;
  imageUrls: string[];
  variants: ProductVariant[];
  createdAt?: string;
}

interface Filters {
  searchText: string;
  status: string;
  sellerId: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

interface Stats {
  active: number;
  pending: number;
  inactive: number;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [shop, setShop] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  // Add missing state variables
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchText: "",
    status: "",
    sellerId: "",
    dateRange: null,
  });
  
  // Add stats state
  const [stats, setStats] = useState<Stats>({
    active: 0,
    pending: 0,
    inactive: 0,
  });

  const token = localStorage.getItem("authToken");

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

  const fetchShop = async () => {
    try {
      const res = await axios.get("https://localhost:7040/api/shop", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data || [];
      setShop(all);
    } catch {
      message.error("Không tải được shop");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://localhost:7040/api/product", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || response.data;

      // Map về đúng Product interface
      const transformed: Product[] = data.map((item: any) => ({
        key: item.productId,
        productId: item.productId,
        productName: item.productName,
        description: item.description,
        originalPrice: item.originalPrice,
        price: item.variants?.[0]?.price ?? item.originalPrice,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        subcategoryId: item.subcategoryId,
        subcategoryName: item.subcategoryName,
        shopId: item.shopId,
        imageUrls: item.imageUrls || [],
        variants: item.variants || [],
        createdAt: item.createdAt,
      }));

      setProducts(transformed);
      setTotal(response.data.total || transformed.length);
      
      // Calculate stats
      const activeCount = transformed.filter(p => p.variants.some(v => v.stockQuantity > 0)).length;
      const pendingCount = Math.floor(transformed.length * 0.1); // Mock pending count
      const inactiveCount = transformed.length - activeCount - pendingCount;
      
      setStats({
        active: activeCount,
        pending: pendingCount,
        inactive: inactiveCount,
      });
      
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setImageUrls([]);
    form.resetFields();
    fetchShop();
    fetchCategories();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setCurrentProduct(record);
    setImageUrls(record.imageUrls || []);
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId,
      subcategoryId: record.subcategoryId,
    });
    fetchShop();
    fetchCategories();
    // Set subcategories based on selected category
    const selectedCategory = record.categoryId;
    if (selectedCategory) {
      setSubcategories(categories.filter((c) => c.parentCategoryId === selectedCategory));
    }
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(`https://localhost:7040/api/product/${productToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Đã xóa sản phẩm");
      setIsDeleteModalVisible(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi xóa sản phẩm");
    }
  };

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

  const showDeleteConfirm = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteModalVisible(true);
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      status: "",
      sellerId: "",
      dateRange: null,
    });
  };

  // Hàm xử lý gửi form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      };
      
      if (currentProduct) {
        await axios.put(`https://localhost:7040/api/product/${currentProduct.productId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Cập nhật thành công");
      } else {
        await axios.post("https://localhost:7040/api/product", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Thêm sản phẩm thành công");
      }
      
      setIsModalVisible(false);
      fetchProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrls",
      key: "image",
      render: (imageUrls: string[]) => (
        <img
          src={imageUrls?.[0] || "https://via.placeholder.com/60x60"}
          alt="Ảnh sản phẩm"
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
    {
      title: "Giá gốc",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (value: number) => formatPrice(value),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (value: number) => formatPrice(value),
    },
    { title: "Danh mục", dataIndex: "categoryName", key: "categoryName" },
    {
      title: "Biến thể",
      key: "variants",
      render: (record: Product) => (
        <Space direction="vertical">
          {record.variants.map((v, i) => (
            <Tag key={i} color={v.brandNew ? "green" : "blue"}>
              {v.size} - {v.colorName} ({v.stockQuantity})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.productId)}>
            Xóa
          </Button>
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
                <h1 style={{ margin: 0, fontSize: 24 }}>Quản lý sản phẩm</h1>
                <p style={{ margin: 0, color: '#666' }}>
                  Quản lý thông tin các sản phẩm trong hệ thống
                </p>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchProducts}
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
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {products?.length || 0}
              </div>
              <div>Tổng sản phẩm</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {stats.active}
              </div>
              <div>Đang hoạt động</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                {stats.pending}
              </div>
              <div>Chờ duyệt</div>
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
                placeholder="Tìm kiếm theo tên, ID..."
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

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps || 10);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          rowKey="productId"
        />
      </Card>

      {/* Modal create and update product */}
      <Modal
        title={currentProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setImageUrls([]);
          form.resetFields();
        }}
        width={900}
        okText={currentProduct ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="originalPrice" label="Giá gốc" rules={[{ required: true, message: "Vui lòng nhập giá gốc" }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Nhập giá gốc" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
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
                    form.setFieldsValue({ subcategoryId: undefined });
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shopId"
                label="Chọn Shop"
                rules={[{ required: true, message: "Vui lòng chọn Shop" }]}
              >
                <Select placeholder="Chọn shop">
                  {shop.map((shop) => (
                    <Select.Option key={shop.shopId} value={shop.shopId}>
                      {shop.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
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
                          <InputNumber min={0} style={{ width: "100%" }} placeholder="Giá bán" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
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
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm biến thể
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal delete product */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setProductToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default ProductManagement;