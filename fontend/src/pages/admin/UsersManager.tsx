import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Row,
  Col,
  Select,
  Dropdown,
  Menu,
  Modal,
  Form,
  message,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import axios from 'axios';

interface User {
  key: string;
  stt: number;
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'Client' | 'Seller' | 'Admin';
  isVerified: boolean;
  isActive: boolean;
  createAt: string;
  updatedAt?: string;
}

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('username');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchUsers = async (search: string = '', page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập lại.');
        return;
      }
      const response = await axios.get('https://localhost:7040/api/admin/users', {
        params: { search, page, pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });
      const { items, totalCount } = response.data;
      const usersWithIndex = items.map((user: any, index: number) => ({
        ...user,
        key: user.userId || index.toString(),
        stt: (page - 1) * pageSize + index + 1,
        role: mapEnumToRole(user.role),
      }));
      setUsers(usersWithIndex);
      setTotal(totalCount || items.length);
    } catch (error: any) {
      console.error('Fetch error:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(searchText, 1, pageSize);
  };

  const handleAdd = () => {
    setCurrentUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setCurrentUser(record);
    form.setFieldsValue({
      ...record,
      isVerified: record.isVerified.toString(),
      isActive: record.isActive.toString(),
    });
    setIsModalVisible(true);
  };

  const showDeleteConfirm = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Vui lòng đăng nhập lại.');
        return;
      }
      await axios.delete(`https://localhost:7040/api/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Xóa người dùng thành công');
      setIsDeleteModalVisible(false);
      fetchUsers(searchText, page, pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
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
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: mapRoleToEnum(values.role),
        password: values.password,
        isVerified: values.isVerified === 'true',
        isActive: values.isActive === 'true',
      };

      if (currentUser) {
        await axios.put(`https://localhost:7040/api/admin/users/${currentUser.userId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Cập nhật người dùng thành công');
      } else {
        await axios.post(`https://localhost:7040/api/admin/users/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Thêm người dùng thành công');
      }
      setIsModalVisible(false);
      fetchUsers(searchText, page, pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu thông tin người dùng');
    }
  };

  const mapEnumToRole = (roleEnum: number): 'Client' | 'Seller' | 'Admin' => {
    switch (roleEnum) {
      case 0: return 'Client';
      case 1: return 'Seller';
      case 2: return 'Admin';
      default: return 'Client'; // fallback
    }
  };

  const mapRoleToEnum = (roleStr: string): number => {
    switch (roleStr) {
      case "Client": return 0;
      case "Seller": return 1;
      case "Admin": return 2;
      default: return 0;
    }
  };

  const columns: ColumnsType<User> = [

    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 'Admin' ? 'blue' : role === 'Seller' ? 'purple' : 'green'}>{role}</Tag>,
    },
    {
      title: 'Xác minh',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified) => <Tag color={verified ? 'green' : 'red'}>{verified ? 'Đã xác minh' : 'Chưa xác minh'}</Tag>,
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '--'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.userId)}
                danger
              >
                Xóa
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    }
  ];

  return (
    <div className="user-management">
      <Card title="QUẢN LÝ NGƯỜI DÙNG">
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Tìm kiếm thông tin">
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    defaultValue="username"
                    onChange={setSearchType}
                    options={[
                      { value: 'username', label: 'Tên người dùng' },
                      { value: 'email', label: 'Email' },
                      { value: 'phoneNumber', label: 'SĐT' },
                    ]}
                  />
                  <Input
                    placeholder={`Nhập ${searchType}`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                  />
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                    Tìm kiếm
                  </Button>
                </Space.Compact>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm mới
            </Button>
            <Button icon={<ImportOutlined />}>Import dữ liệu</Button>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
          </Space>
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1300 }}
          bordered
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
              fetchUsers(searchText, newPage, newPageSize);
            },
          }}
        />
      </Card>

      {/* modal add & update */}
      <Modal
        title={currentUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText={currentUser ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input placeholder="Nhập username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input placeholder="Nhập SĐT" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select
                  options={[
                    { value: 'Client', label: 'Client' },
                    { value: 'Seller', label: 'Seller' },
                    { value: 'Admin', label: 'Admin' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" label="Kích hoạt">
                <Select
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isVerified" label="Đã xác minh">
                <Select
                  options={[
                    { value: 'true', label: 'Có' },
                    { value: 'false', label: 'Không' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: !currentUser, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa người dùng"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default UsersManager;