import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table, Input, Button, Card, Row, Col, Modal, Form, Select, message,
  Space, Tag, Spin, Typography,
  Upload
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios, { AxiosError } from 'axios';

const { Title } = Typography;

interface Category {
  categoryId: string;
  key: string;
  stt: number;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentName?: string;
  slug: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}


interface CreateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: string;
  slug: string;
  status: 'active' | 'inactive';
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Constants
const API_URL = 'https://localhost:7040/api/categories';
const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
const MODAL_WIDTH = 600;

const CategoriesManager: React.FC = () => {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('authToken');

  // Effects
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchText, categories]);

  // Utility functions
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error('API Error:', error);
    const errorMessage = error?.response?.data?.message || defaultMessage;
    message.error(errorMessage);
  };

  const filterCategories = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  // API calls
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Category[]>>(API_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data = response.data.data || response.data;

      const mappedData = Array.isArray(data) ? data.map((item: any, index: number) => ({
        categoryId: item.categoryId,
        key: item.categoryId,
        stt: index + 1,
        name: item.name,
        slug: item.slug || '',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        parentCategoryId: item.parentCategoryId || null,
        parentName: item.parentCategoryName || null,
        status: item.status || 'active',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })) : [];


      setCategories(mappedData);
      setFilteredCategories(mappedData);
    } catch (error) {
      handleApiError(error, 'Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleResetSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const handleAdd = useCallback(() => {
    setCurrentCategory(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setIsModalVisible(true);
  }, [form]);

  const handleEdit = useCallback((record: Category) => {
    setCurrentCategory(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      imageUrl: record.imageUrl,
      parentCategoryId: record.parentCategoryId || undefined,
      status: record.status || 'active'
    });
    setIsModalVisible(true);
  }, [form]);



  const showDeleteConfirm = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('Vui lòng đăng nhập lại.');
      return;
    }

    const category = categories.find(c => c.categoryId === categoryToDelete);
    const hasChildren = categories.some(c => c.parentCategoryId === categoryToDelete);

    if (hasChildren) {
      message.warning(`Không thể xóa danh mục "${category?.name}" vì có danh mục con phụ thuộc.`);
      setIsDeleteModalVisible(false);
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${categoryToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`Đã xóa danh mục "${category?.name}"`);
      setIsDeleteModalVisible(false);
      setCategoryToDelete(null);

      // Cập nhật lại danh sách từ API để đồng bộ
      fetchCategories();
    } catch (error) {
      handleApiError(error, 'Xóa danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      // Validate slug uniqueness
      const slugExists = categories.some(cat =>
        cat.slug === values.slug && cat.categoryId !== currentCategory?.categoryId
      );

      if (slugExists) {
        message.error('Slug đã tồn tại, vui lòng chọn slug khác');
        return;
      }

      const payload: CreateCategoryDto = {
        ...values,
        parentCategoryId: values.parentCategoryId || undefined
      };

      if (currentCategory) {
        // Update existing category
        const response = await axios.put<ApiResponse<Category>>(
          `${API_URL}/${currentCategory.categoryId}`, payload, { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedCategory = response.data.data || response.data;

        setCategories(prev => prev.map(cat =>
          cat.categoryId === currentCategory.categoryId ? { ...cat, ...updatedCategory, key: updatedCategory.categoryId } : cat
        ));

        message.success('Cập nhật danh mục thành công');
      } else {
        // Create new category
        const response = await axios.post<ApiResponse<Category>>(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const newCategory = response.data.data || response.data;
        const categoryWithMeta = {
          ...newCategory,
          key: newCategory.categoryId,
          stt: categories.length + 1,
          parentName: payload.parentCategoryId
            ? categories.find(c => c.categoryId === payload.parentCategoryId)?.name
            : undefined
        };
        setCategories(prev => [...prev, categoryWithMeta]);
        message.success('Thêm danh mục thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        // Form validation error - don't show additional error message
        return;
      }
      handleApiError(error, 'Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setCurrentCategory(null);
    form.resetFields();
  }, [form]);

  // Computed values
  const parentCategories = useMemo(() =>
    categories.filter(cat => !cat.parentCategoryId),
    [categories]
  );

  const availableParentCategories = useMemo(() => {
    if (!currentCategory) return parentCategories;
    // Prevent circular references
    return parentCategories.filter(cat => cat.categoryId !== currentCategory.categoryId);
  }, [parentCategories, currentCategory]);

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name && !currentCategory) {
      const slug = generateSlug(name);
      form.setFieldsValue({ slug });
    }
  };

  // Table columns
  const columns: ColumnsType<Category> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.stt - b.stt
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => <code>{text}</code>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span style={{ color: '#999' }}>--</span>,
      ellipsis: true
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parentName',
      key: 'parentName',
      render: (text) => text || <span style={{ color: '#999' }}>--</span>,
      filters: parentCategories.map(cat => ({ text: cat.name, value: cat.categoryId })),
      onFilter: (value, record) => record.parentCategoryId === value as string,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: 'active' | 'inactive') => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Tạm dừng', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
            size="small"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.categoryId)}
            danger
            title="Xóa"
            size="small"
          />

        </Space>
      )
    }
  ];

  return (
    <div className="categories-manager">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý danh mục sản phẩm
          </Title>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, mô tả, slug..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCategories}
                loading={loading}
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm danh mục
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          rowKey="categoryId"
          bordered
          scroll={{ x: true }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} danh mục`,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            defaultPageSize: 20
          }}
        />
      </Card>

      <Modal
        title={currentCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        okText={currentCategory ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        confirmLoading={isSubmitting}
        destroyOnClose
        width={MODAL_WIDTH}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên danh mục không quá 100 ký tự' },
              {
                pattern: /^[a-zA-ZÀ-ỹ0-9\s]+$/,
                message: 'Tên danh mục chỉ chứa chữ cái, số và khoảng trắng'
              }
            ]}
          >
            <Input
              placeholder="Nhập tên danh mục"
              onChange={handleNameChange}
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL thân thiện)"
            rules={[
              { required: true, message: 'Vui lòng nhập slug' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'
              },
              { min: 2, message: 'Slug phải có ít nhất 2 ký tự' },
              { max: 50, message: 'Slug không quá 50 ký tự' }
            ]}
          >
            <Input
              placeholder="vd: dien-thoai-smartphone"
              maxLength={50}
            />
          </Form.Item>

          <Form.Item name="imageUrl" label="Ảnh danh mục">
            <Upload
              name="file"
              action="https://localhost:7040/api/categories/upload-image-cloud"
              listType="picture-card"
              showUploadList={false}
              headers={{
                Authorization: `Bearer ${token}`, // nhớ thêm token
              }}
              onChange={(info) => {
                if (info.file.status === 'done') {
                  const response = info.file.response;
                  const url = response?.imageUrl;

                  if (url) {
                    form.setFieldsValue({ imageUrl: url });
                    message.success("Tải ảnh thành công!");
                  } else {
                    message.error("Không nhận được đường dẫn ảnh");
                  }
                } else if (info.file.status === 'error') {
                  message.error("Tải ảnh thất bại!");
                }
              }}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>

            {/* Hiển thị ảnh nếu đã có */}
            {form.getFieldValue('imageUrl') && (
              <img
                src={form.getFieldValue('imageUrl')}
                alt="Ảnh danh mục"
                style={{ marginTop: 16, maxHeight: 120, border: '1px solid #eee', borderRadius: 8 }}
              />
            )}
          </Form.Item>


          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: 'Mô tả không quá 500 ký tự' }
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả chi tiết cho danh mục..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parentCategoryId"
                label="Danh mục cha"
                tooltip="Để trống nếu đây là danh mục gốc"
              >
                <Select
                  allowClear
                  placeholder="Chọn danh mục cha"
                  options={availableParentCategories.map(cat => ({
                    value: cat.categoryId,
                    label: cat.name
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="active"
                rules={[
                  { required: true, message: 'Vui lòng chọn trạng thái' }
                ]}
              >
                <Select
                  options={[
                    { value: 'active', label: 'Hoạt động' },
                    { value: 'inactive', label: 'Tạm dừng' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>


      {/* modal delete */}
      <Modal
        title='Xác nhận xóa danh mục này'
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        <p>Bạn có chắc chắn muốn xóa danh mục không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default CategoriesManager;