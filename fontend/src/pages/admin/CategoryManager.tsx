import React, { useState, useEffect } from 'react';
import {
  Table, Input, Button, Card, Row, Col, Modal, Form, Select, message, Dropdown, Menu
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Category {
  key: string;
  stt: number;
  name: string;
  description: string;
  parentCategoryId?: string;
  parentName?: string;
}

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Replace with real API
      const mockData: Category[] = [
        {
          key: '1',
          stt: 1,
          name: 'Áo',
          description: 'Danh mục áo thời trang',
          parentCategoryId: '',
          parentName: ''
        },
        {
          key: '2',
          stt: 2,
          name: 'Áo sơ mi',
          description: 'Danh mục con của Áo',
          parentCategoryId: '1',
          parentName: 'Áo'
        }
      ];
      setCategories(mockData);
    } catch (error) {
      message.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // You can implement search by API here
    console.log('Searching for', searchText);
  };

  const handleAdd = () => {
    setCurrentCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Category) => {
    setCurrentCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa danh mục này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setCategories(categories.filter((c) => c.key !== id));
        message.success('Xóa danh mục thành công');
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (currentCategory) {
        const updated = categories.map((cat) =>
          cat.key === currentCategory.key ? { ...cat, ...values } : cat
        );
        setCategories(updated);
        message.success('Cập nhật danh mục thành công');
      } else {
        const newCategory: Category = {
          key: Date.now().toString(),
          stt: categories.length + 1,
          ...values
        };
        setCategories([...categories, newCategory]);
        message.success('Thêm danh mục thành công');
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error('Lỗi submit form:', error);
    }
  };

  const columns: ColumnsType<Category> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 80, align: 'center' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Danh mục cha',
      dataIndex: 'parentName',
      key: 'parentName',
      render: (text) => text || '--'
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                Sửa
              </Menu.Item>
              <Menu.Item icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)}>
                Xóa
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="category-manager">
      <Card title="QUẢN LÝ DANH MỤC SẢN PHẨM">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tên danh mục"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              suffix={<SearchOutlined onClick={handleSearch} />}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="key"
          bordered
        />
      </Card>

      <Modal
        title={currentCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={currentCategory ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="parentCategoryId" label="Danh mục cha">
            <Select allowClear placeholder="Chọn danh mục cha">
              {categories.map((cat) => (
                <Select.Option key={cat.key} value={cat.key}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesManager;
