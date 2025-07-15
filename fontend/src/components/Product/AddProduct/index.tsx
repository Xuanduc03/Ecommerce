import React, { useState } from 'react';
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
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Option } = Select;

const AddProductStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const next = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = (values: any) => {
    console.log('Final Product Data:', values);
    message.success('Tạo sản phẩm thành công!');
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <Card title="Thông tin sản phẩm">
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Giá cơ bản"
            name="price"
            rules={[{ required: true, message: 'Nhập giá sản phẩm' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item label="Danh mục" name="categories">
            <Select mode="multiple" placeholder="Chọn danh mục">
              <Option value="quan">Quần</Option>
              <Option value="ao">Áo</Option>
              <Option value="giay">Giày</Option>
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: 'Ảnh sản phẩm',
      content: (
        <Card title="Tải ảnh lên">
          <Form.Item
            label="Hình ảnh"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => e && e.fileList}
          >
            <Upload name="image" listType="picture" multiple>
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: 'Biến thể sản phẩm',
      content: (
        <Card title="Biến thể">
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'size']}
                      rules={[{ required: true, message: 'Nhập size' }]}
                    >
                      <Input placeholder="Size" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'colorName']}
                      rules={[{ required: true, message: 'Nhập màu' }]}
                    >
                      <Input placeholder="Màu" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'stockQuantity']}
                      rules={[{ required: true, message: 'Nhập tồn kho' }]}
                    >
                      <InputNumber min={0} placeholder="Tồn kho" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Thêm biến thể
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>

      <div>{steps[currentStep].content}</div>

      <div style={{ marginTop: 24 }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Quay lại
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Tiếp tục
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" htmlType="submit">
            Hoàn tất
          </Button>
        )}
      </div>
    </Form>
  );
};

export default AddProductStepForm;
