import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment, { type Moment } from 'moment';
import { useNavigate } from 'react-router-dom';

// Types matching backend DTOs
interface DiscountDto {
  discountId: string;
  name: string;
  orderId?: string;
  shopId: string;
  startDate: string;
  endDate: string;
  productIds: string[];
  discountType: string;
  discountValue: number;
}

interface CreateDiscountDto {
  name: string;
  orderId?: string;
  shopId: string;
  startDate: string;
  endDate: string;
  productIds: string[];
  discountType: string;
  discountValue: number;
}

interface UpdateDiscountDto {
  name: string;
  orderId?: string;
  shopId: string;
  startDate: string;
  endDate: string;
  productIds: string[];
  discountType: string;
  discountValue: number;
}

interface ShopDto {
  shopId: string;
  shopName: string;
}

interface ProductDto {
  productId: string;
  productName: string;
  shopId: string;
}

const API_URL = 'https://localhost:7040/api';

const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountDto | null>(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchDiscounts = async () => {
    if (!token) {
      message.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/discount`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${API_URL}/shop`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tải được danh sách shop');
    }
  };

  const fetchProducts = async (shopId: string) => {
    try {
      const response = await axios.get(`${API_URL}/product?shopId=${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không tải được danh sách sản phẩm');
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchShops();
  }, [token, navigate]);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentDiscount(null);
    setProducts([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (discount: DiscountDto) => {
    setIsEditing(true);
    setCurrentDiscount(discount);
    fetchProducts(discount.shopId);
    form.setFieldsValue({
      name: discount.name,
      orderId: discount.orderId || '',
      shopId: discount.shopId,
      startDate: moment(discount.startDate),
      endDate: moment(discount.endDate),
      productIds: discount.productIds,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (discountId: string) => {
    try {
      await axios.delete(`${API_URL}/discount/${discountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(discounts.filter(d => d.discountId !== discountId));
      message.success('Xóa mã giảm giá thành công');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  const handleOk = async () => {
  try {
    const values = await form.validateFields();
    const payload: CreateDiscountDto | UpdateDiscountDto = {
      name: values.name,
      orderId: values.orderId || null,
      shopId: values.shopId,
      startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
      productIds: values.productIds || [],
      discountType: values.discountType,
      discountValue: parseFloat(values.discountValue), // Convert to number
    };

    if (isEditing && currentDiscount) {
      const response = await axios.put(`${API_URL}/discount/${currentDiscount.discountId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(discounts.map(d => (d.discountId === currentDiscount.discountId ? response.data : d)));
      message.success('Cập nhật mã giảm giá thành công');
    } else {
      const response = await axios.post(`${API_URL}/discount`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts([...discounts, response.data]);
      message.success('Tạo mã giảm giá thành công');
    }
    setIsModalVisible(false);
    form.resetFields();
    setProducts([]);
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu mã giảm giá');
  }
};

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setProducts([]);
  };

  const handleShopChange = (shopId: string) => {
    form.setFieldsValue({ productIds: [] });
    fetchProducts(shopId);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'discountId',
      key: 'discountId',
      width: 100,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Shop ID',
      dataIndex: 'shopId',
      key: 'shopId',
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Sản phẩm áp dụng',
      dataIndex: 'productIds',
      key: 'productIds',
      render: (productIds: string[]) => productIds.length ? productIds.join(', ') : 'Tất cả sản phẩm',
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (text: string) => (text === 'Percentage' ? 'Phần trăm' : 'Số tiền cố định'),
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value: number, record: DiscountDto) =>
        record.discountType === 'Percentage' ? `${value}%` : formatCurrency(value),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: DiscountDto) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa mã giảm giá này?"
            onConfirm={() => handleDelete(record.discountId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Utility function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Quản lý mã giảm giá</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: '16px' }}
      >
        Thêm mã giảm giá
      </Button>
      <Table
        columns={columns}
        dataSource={discounts}
        rowKey="discountId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={isEditing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditing ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên mã giảm giá"
            rules={[{ required: true, message: 'Vui lòng nhập tên mã giảm giá' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="orderId"
            label="Order ID"
            rules={[{ required: false }]}
          >
            <Input placeholder="Để trống nếu không áp dụng cho đơn hàng cụ thể" />
          </Form.Item>
          <Form.Item
            name="shopId"
            label="Chọn Shop"
            rules={[{ required: true, message: 'Vui lòng chọn Shop' }]}
          >
            <Select placeholder="Chọn shop" onChange={handleShopChange}>
              {shops.map((shop) => (
                <Select.Option key={shop.shopId} value={shop.shopId}>
                  {shop.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="productIds"
            label="Sản phẩm áp dụng"
            rules={[{ required: false }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm (để trống nếu áp dụng cho tất cả)"
              allowClear
            >
              {products.map((product) => (
                <Select.Option key={product.productId} value={product.productId}>
                  {product.productName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
          >
            <Select placeholder="Chọn loại giảm giá">
              <Select.Option value="Percentage">Phần trăm</Select.Option>
              <Select.Option value="FixedAmount">Số tiền cố định</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discountValue"
            label="Giá trị giảm giá"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm giá' },
              ({ getFieldValue }) => ({
                validator(_, value: number) {
                  if (!value || value <= 0) {
                    return Promise.reject(new Error('Giá trị giảm giá phải lớn hơn 0'));
                  }
                  if (getFieldValue('discountType') === 'Percentage' && value > 100) {
                    return Promise.reject(new Error('Phần trăm giảm giá không được vượt quá 100%'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
              ({ getFieldValue }) => ({
                validator(_, value: Moment) {
                  if (!value || !getFieldValue('startDate') || getFieldValue('startDate').isBefore(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                },
              }),
            ]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountManagement;