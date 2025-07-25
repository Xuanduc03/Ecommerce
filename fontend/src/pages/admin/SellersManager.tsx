import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  Input,
  Row,
  Col,
  Modal,
  Form,
  message,
  Dropdown,
  Menu,
  Select,
  DatePicker,
  Divider
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface Seller {
  key: string;
  sellerId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  description: string;
  shopName: string | null;
  requestAt: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
}

const SellerManagement: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchSellers = async (search: string = '', page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập lại.');
        return;
      }
      const response = await axios.get('https://localhost:7040/api/admin/sellers', {
        params: { search, page, pageSize, status: filterStatus !== 'all' ? filterStatus : undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      const { items, totalCount } = response.data;
      const sellersWithIndex = items.map((seller: any, index: number) => ({
        ...seller,
        key: seller.userId || index.toString(),
        stt: (page - 1) * pageSize + index + 1,
      }));
      setSellers(sellersWithIndex);
      setTotal(totalCount || items.length);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách seller');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [filterStatus]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
    fetchSellers(value, 1, pageSize);
  };

  const handleAdd = () => {
    setCurrentSeller(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Seller) => {
    setCurrentSeller(record);
    form.setFieldsValue({
      name: record.userFullName,
      email: record.userEmail,
      description: record.description,
      shopName: record.shopName,
      requestAt: record.requestAt ? dayjs(record.requestAt) : null,
      status: record.status,
    });

    setIsModalVisible(true);
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa seller này?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('authToken');
          await axios.delete(`https://localhost:7040/api/admin/sellers/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success('Xóa seller thành công');
          fetchSellers(searchText, page, pageSize);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi khi xóa seller');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập lại.');
        return;
      }
      const payload = {
        user: { name: values.name, email: values.email },
        description: values.description,
        shop: { name: values.shopName },
        requestAt: values.requestAt ? values.requestAt.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        status: values.status,
      };
      if (currentSeller) {
        await axios.put(`https://localhost:7040/api/admin/sellers/${currentSeller.sellerId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        message.success('Cập nhật seller thành công');
      } else {
        await axios.post(`https://localhost:7040/api/admin/sellers`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Thêm seller thành công');
      }
      setIsModalVisible(false);
      fetchSellers(searchText, page, pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu thông tin seller');
    }
  };

  const columns: ColumnsType<Seller> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 80, align: 'center' },
    { title: 'Tên người dùng', dataIndex: 'userFullName', key: 'userFullName' },
    { title: 'Email', dataIndex: 'userEmail', key: 'userEmail', width: 200 },
    { title: "Trạng thái", dataIndex: 'status', key: 'status', width: 150 },
    { title: 'Mô tả đăng ký', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Tên shop', dataIndex: 'shopName', key: 'shopName', render: (name) => name || <i>Chưa tạo</i>, width: 150 },
    { title: 'Ngày yêu cầu', dataIndex: 'requestAt', key: 'requestAt', render: (date) => dayjs(date).format('DD/MM/YYYY'), width: 150 },
    {
      title: 'Hành động', key: 'actions', width: 200, fixed: 'right', render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>Xem</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.sellerId || record.key)}>Xóa</Button>
        </Space>
      )
    },
  ];

  const handleView = (record: Seller) => {
    setCurrentSeller(record);
    setIsModalVisible(true);
  };

  return (
    <div className="seller-management">
      <Card title="QUẢN LÝ SELLER">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tên hoặc email"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              onChange={(value) => setFilterStatus(value)}
              allowClear
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="Pending">Chờ duyệt</Select.Option>
              <Select.Option value="Approved">Đã duyệt</Select.Option>
              <Select.Option value="Rejected">Từ chối</Select.Option>
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Thêm seller
              </Button>
              <Button icon={<ImportOutlined />}>Import</Button>
              <Button icon={<ExportOutlined />}>Export</Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={sellers}
          loading={loading}
          scroll={{ x: 1500 }}
          bordered
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
              fetchSellers(searchText, newPage, newPageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={currentSeller ? (currentSeller.userId ? 'Sửa seller' : 'Thêm seller mới') : 'Chi tiết seller'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        footer={currentSeller?.userId ? [
          <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Lưu</Button>,
        ] : [
          <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Thêm</Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên người dùng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả đăng ký">
                <Input.TextArea placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shopName" label="Tên shop">
                <Input placeholder="Nhập tên shop" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="requestAt" label="Ngày yêu cầu">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                <Select>
                  <Select.Option value="Pending">Chờ duyệt</Select.Option>
                  <Select.Option value="Approved">Đã duyệt</Select.Option>
                  <Select.Option value="Rejected">Từ chối</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SellerManagement;