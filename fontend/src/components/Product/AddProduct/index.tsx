import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Steps,
  Card,
  Select,
  Space,
  message,
  InputNumber,
  Switch,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Step } = Steps;
const { Option } = Select;
const { Text, Title } = Typography;

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

interface CreateProductData {
  productName: string;
  description: string;
  originalPrice: number;
  shopId: string;
  categoryId: string;
  subcategoryId: string;
  imageUrls: string[];
  variants: ProductVariant[];
}

const AddProductStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [productForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);

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

  const fetchShopForSeller = async () => {
    try {
      const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      if (!seller?.sellerId) {
        return message.error("Không tìm thấy thông tin seller!");
      }
      const shopRes = await axios.get(`https://localhost:7040/api/shop/seller/${seller.sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = shopRes.data;
      if (!shop?.shopId) {
        return message.error("Seller chưa có cửa hàng!");
      }
      setShopId(shop.shopId);
      productForm.setFieldsValue({ shopId: shop.shopId });
    } catch (error) {
      message.error("Không thể tải thông tin Shop cho seller!");
    }
  };


  useEffect(() => {
    fetchCategories();
    fetchShopForSeller();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    const subs = categories.filter((c: any) => c.parentCategoryId === categoryId);
    setSubcategories(subs);
    productForm.setFieldValue('subcategoryId', undefined);
  };

  const validateStep = async (step: number) => {
    const fieldsToValidate: Record<number, string[]> = {
      0: ['productName', 'description', 'originalPrice', 'shopId', 'categoryId', 'subcategoryId'],
      1: [], // kiểm tra ảnh riêng
      2: ['variants']
    };

    try {
      if (step === 1) {
        if (imageUrls.length === 0) {
          message.error('Vui lòng tải lên ít nhất 1 hình ảnh!');
          return false;
        }
      } else if (fieldsToValidate[step]?.length) {
        await productForm.validateFields(fieldsToValidate[step]);
      }
      return true;
    } catch {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return false;
    }
  };

  const next = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) setCurrentStep(currentStep + 1);
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const handleFinish = async (values: any) => {
    // Kiểm tra trùng biến thể
    const duplicate = (values.variants || []).some((v: any, idx: number) =>
      values.variants.findIndex((x: any, i: number) =>
        x.size === v.size && x.colorName === v.colorName && i !== idx) !== -1
    );
    if (duplicate) {
      return message.error('Không được có 2 biến thể trùng Size + Màu!');
    }

    setLoading(true);
    try {
      const allValues = productForm.getFieldsValue(true);
      const productData: CreateProductData = {
        productName: allValues.productName,
        description: allValues.description,
        originalPrice: allValues.originalPrice,
        shopId: shopId || "",
        categoryId: allValues.categoryId,
        subcategoryId: allValues.subcategoryId,
        imageUrls,
        variants: allValues.variants.map((variant: any) => ({
          ...variant,
          colorCode: typeof variant.colorCode === 'object'
            ? variant.colorCode.toString()
            : variant.colorCode
        })),
      };

      await axios.post("https://localhost:7040/api/product", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success('Tạo sản phẩm thành công!');
      productForm.resetFields();
      setImageUrls([]);
      setCurrentStep(0);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm!');
    } finally {
      setLoading(false);
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

  const removeImage = (index: number) =>
    setImageUrls(prev => prev.filter((_, i) => i !== index));

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <Card title="📝 Thông tin sản phẩm">
          <Row gutter={[16, 16]}>
            {/* Các field thông tin cơ bản */}
            <Col span={24}>
              <Form.Item
                label="Tên sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                  { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="VD: Áo thun nam basic" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả sản phẩm"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giá gốc (VNĐ)"
                name="originalPrice"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá!' },
                  { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1.000đ' }
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Nhập giá gốc" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>

            <Form.Item name="shopId" hidden>
              <Input type="hidden" />
            </Form.Item>


            <Col span={12}>
              <Form.Item
                label="Danh mục chính"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select onChange={handleCategoryChange} placeholder="Chọn danh mục">
                  {parentCategories.map(cat => (
                    <Option key={cat.categoryId} value={cat.categoryId}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Danh mục phụ"
                name="subcategoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục phụ!' }]}
              >
                <Select disabled={!subcategories.length} placeholder="Chọn danh mục phụ">
                  {subcategories.map(sub => (
                    <Option key={sub.categoryId} value={sub.categoryId}>{sub.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      title: 'Hình ảnh sản phẩm',
      content: (
        <Card title="📸 Hình ảnh sản phẩm">
          <Upload beforeUpload={handleUpload} multiple showUploadList={false}>
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
            {imageUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img
                  src={url}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    border: i === 0 ? '3px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                />
                {i === 0 && (
                  <Tag color="blue" style={{ position: 'absolute', top: 4, left: 4 }}>Ảnh chính</Tag>
                )}
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  type="text"
                  size="small"
                  style={{ position: 'absolute', top: 4, right: 4 }}
                  onClick={() => removeImage(i)}
                />
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    {
      title: 'Biến thể sản phẩm',
      content: (
        <Card title="🎨 Thông tin biến thể">
          <Form.List name="variants" initialValue={[{ brandNew: true, stockQuantity: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16 }}
                    title={`Biến thể ${idx + 1}`}
                    extra={fields.length > 1 && (
                      <Button danger type="text" onClick={() => remove(name)} icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    )}
                  >
                    <Row gutter={[12, 12]}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'size']}
                          label="Kích cỡ / Thuộc tính"
                          rules={[{ required: true, message: 'Vui lòng nhập thông số (VD: 128GB, 500ml)' }]}
                        >
                          <Input placeholder="VD: 128GB, 500ml, 16GB RAM..." />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'colorName']} label="Tên màu" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'colorCode']} label="Mã màu" rules={[{ required: true }]}>
                          <Input placeholder="#FF0000" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'stockQuantity']} label="Số lượng tồn" rules={[{ required: true }]}>
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'price']} label="Giá bán (VNĐ)" rules={[{ required: true }]}>
                          <InputNumber min={0} style={{ width: "100%" }} placeholder="Nhập giá gốc" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'brandNew']} label="Hàng mới" valuePropName="checked" initialValue={true}>
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'features']} label="Đặc điểm nổi bật">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'seoDescription']} label="Mô tả SEO">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ brandNew: true, stockQuantity: 0, price: productForm.getFieldValue('originalPrice') || 0 })}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm biến thể mới
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      ),
    }
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>🛍️ Thêm sản phẩm mới</Title>

      <Form
        form={productForm}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ shopId: shopId || "", brandNew: true, variants: [{ brandNew: true, stockQuantity: 0 }] }}
      >
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(s => <Step key={s.title} title={s.title} />)}
        </Steps>

        <Spin spinning={loading}>
          <div style={{ minHeight: 400 }}>{steps[currentStep].content}</div>
        </Spin>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button onClick={prev} disabled={loading}>← Quay lại</Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next} disabled={loading}>Tiếp tục →</Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" htmlType="submit" loading={loading} size="large">🎉 Tạo sản phẩm</Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default AddProductStepForm;
