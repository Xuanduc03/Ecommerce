import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment, { type Moment } from 'moment';
import { useNavigate } from 'react-router-dom';

interface DiscountDto {
  discountId: string;
  name: string;
  orderId?: string; // Có thể không bắt buộc
  shopId: string;
  startDate: string;
  endDate: string;
}

interface CreateDiscountDto {
  name: string;
  orderId?: string;
  shopId: string;
  startDate: string;
  endDate: string;
}

interface UpdateDiscountDto {
  name: string;
  orderId?: string;
  startDate: string;
  endDate: string;
}

const API_URL = 'https://localhost:7040/api';

const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shop, setShop] = useState<any[]>([]);
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

  useEffect(() => {
    fetchDiscounts();
  }, [token, navigate]);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentDiscount(null);
    fetchShop();
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (discount: DiscountDto) => {
    setIsEditing(true);
    setCurrentDiscount(discount);
    form.setFieldsValue({
      name: discount.name,
      orderId: discount.orderId || '',
      shopId: discount.shopId,
      startDate: moment(discount.startDate),
      endDate: moment(discount.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (discountId: string) => {
    try {
      await axios.delete(`${API_URL}/discount/${discountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(discounts.filter(d => d.discountId !== discountId)); // Cập nhật state trực tiếp
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
        orderId: values.orderId || null, // Cho phép orderId null
        shopId: values.shopId,
        startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
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
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu mã giảm giá');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
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
            rules={[{ required: false }]} // Không bắt buộc
          >
            <Input placeholder="Để trống nếu không áp dụng cho đơn hàng cụ thể" />
          </Form.Item>
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