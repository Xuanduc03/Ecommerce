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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";

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
  subcategoryId: string;
  shopId?: string;
  imageUrls: string[];
  variants: ProductVariant[];
  createdAt?: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [shop, setShop] = useState<any[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

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
      message.error("Không tải được danh mục");
    }
  }

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
        categoryName: item.categoryName,
        subcategoryName: item.subcategoryName,
        shopId: item.shopId,
        imageUrls: item.imageUrls || [],
        variants: item.variants || [],
        createdAt: item.createdAt,
      }));

      setProducts(transformed);
      setTotal(response.data.total || transformed.length);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token])

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
    form.setFieldsValue(record);
    fetchShop();
    fetchCategories();
    setIsModalVisible(true);
  };

  const handleDelete = (productId: string) => {
    Modal.confirm({
      title: "Xóa sản phẩm?",
      content: "Bạn chắc chắn muốn xóa?",
      onOk: async () => {
        try {
          await axios.delete(`https://localhost:7040/api/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Đã xóa sản phẩm");
          await axios.delete(`https://localhost:7040/api/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Đã xóa sản phẩm");
          fetchProducts(); // chỉ cần gọi lại để reload

        } catch (err: any) {
          message.error(err.response?.data?.message || "Lỗi xóa sản phẩm");
        }
      },
    });
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
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
    }
  };

  const columns = [
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
    { title: "Giá gốc", dataIndex: "originalPrice", key: "originalPrice" },
    { title: "Giá bán", dataIndex: "price", key: "price" },
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
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.productId)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Quản lý sản phẩm">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
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
              setPageSize(ps);
            },
          }}
          rowKey="productId"
        />
      </Card>

      <Modal
        title={currentProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="originalPrice" label="Giá gốc" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
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
                    <Select.Option key={shop.sellerId} value={shop.sellerId}>
                      {shop.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>



          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm">
            <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              {imageUrls.map((url, i) => (
                <img key={i} src={url} style={{ width: 80, height: 80, marginRight: 8 }} />
              ))}
            </div>
          </Form.Item>

          <Divider>Biến thể</Divider>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Row gutter={16} key={key}>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, "size"]} label="Size">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, "colorName"]} label="Màu">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, "stockQuantity"]} label="Tồn kho">
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...rest} name={[name, "price"]} label="Giá">
                        <InputNumber min={0} style={{ width: "100%" }} />
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
                      <Button danger onClick={() => remove(name)}>
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  + Thêm biến thể
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
