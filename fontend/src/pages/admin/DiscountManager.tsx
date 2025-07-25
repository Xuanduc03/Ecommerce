import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment, { type Moment} from 'moment';

interface DiscountDto {
  discountId: string;
  name: string;
  orderId: string;
  shopId: string;
  startDate: string;
  endDate: string;
}

interface CreateDiscountDto {
  name: string;
  orderId: string;
  shopId: string;
  startDate: string;
  endDate: string;
}

interface UpdateDiscountDto {
  name: string;
  orderId: string;
  startDate: string;
  endDate: string;
}

const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountDto | null>(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem('authToken');

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7040/api/Discount', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscounts(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentDiscount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (discount: DiscountDto) => {
    setIsEditing(true);
    setCurrentDiscount(discount);
    form.setFieldsValue({
      name: discount.name,
      orderId: discount.orderId,
      shopId: discount.shopId,
      startDate: moment(discount.startDate),
      endDate: moment(discount.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (discountId: string) => {
    try {
      await axios.delete(`https://localhost:7040/api/Discount/${discountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Xóa mã giảm giá thành công');
      fetchDiscounts();
    } catch (error) {
      message.error('Lỗi khi xóa mã giảm giá');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateDiscountDto | UpdateDiscountDto = {
        name: values.name,
        orderId: values.orderId,
        shopId: values.shopId,
        startDate: values.startDate.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: values.endDate.format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (isEditing && currentDiscount) {
        await axios.put(`https://localhost:7040/api/Discount/${currentDiscount.discountId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await axios.post('https://localhost:7040/api/Discount', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Tạo mã giảm giá thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchDiscounts();
    } catch (error) {
      message.error('Lỗi khi lưu mã giảm giá');
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
            rules={[{ required: true, message: 'Vui lòng nhập Order ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="shopId"
            label="Shop ID"
            rules={[{ required: true, message: 'Vui lòng nhập Shop ID' }]}
          >
            <Input />
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