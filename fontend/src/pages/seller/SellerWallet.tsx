import React, { useEffect, useState } from "react";
import { Card, Table, Typography, Tag, Space, Button, Modal, Form, Input, message } from "antd";
import { CreditCardOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Transaction {
  id: string;
  amount: number;
  type: "withdraw" | "deposit";
  description: string;
  createdAt: string;
  status: "success" | "pending" | "failed";
}

interface Wallet {
  balance: number;
  accountNumber: string;
  provider: "momo" | "vnpay" | null;
}

const dummyTransactions: Transaction[] = [
  {
    id: "TX001",
    amount: 500000,
    type: "deposit",
    description: "Người dùng thanh toán đơn hàng",
    createdAt: "2025-08-01T10:15:00Z",
    status: "success"
  },
  {
    id: "TX002",
    amount: 200000,
    type: "withdraw",
    description: "Rút tiền về Momo",
    createdAt: "2025-08-02T14:45:00Z",
    status: "pending"
  }
];

const SellerWallet: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet>({
    balance: 1000000,
    accountNumber: "0934567890",
    provider: "momo"
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setTransactions(dummyTransactions);
  }, []);

  const handleUpdateAccount = (values: any) => {
    setWallet({
      ...wallet,
      provider: values.provider,
      accountNumber: values.accountNumber
    });
    message.success("Cập nhật tài khoản thành công");
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <Card>
        <Title level={3}>Ví của tôi</Title>
        <Space size="large">
          <div>
            <Text strong>Số dư hiện tại:</Text>
            <Title level={2} style={{ color: "#52c41a" }}>
              {wallet.balance.toLocaleString()} đ
            </Title>
          </div>

          <div>
            <Text strong>Tài khoản nhận tiền:</Text>
            <p>
              {wallet.provider ? (
                <>
                  {wallet.provider.toUpperCase()} - {wallet.accountNumber}
                </>
              ) : (
                <i>Chưa thiết lập</i>
              )}
            </p>
            <Button
              icon={<CreditCardOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Thiết lập tài khoản
            </Button>
          </div>
        </Space>
      </Card>

      <Card className="mt-6" title="Lịch sử giao dịch">
        <Table dataSource={transactions} rowKey="id" pagination={{ pageSize: 5 }}>
          <Table.Column title="Mã giao dịch" dataIndex="id" />
          <Table.Column
            title="Loại"
            dataIndex="type"
            render={(type) =>
              type === "deposit" ? (
                <Tag color="green">Nạp</Tag>
              ) : (
                <Tag color="orange">Rút</Tag>
              )
            }
          />
          <Table.Column
            title="Số tiền"
            dataIndex="amount"
            render={(amount) => `${amount.toLocaleString()} đ`}
          />
          <Table.Column title="Mô tả" dataIndex="description" />
          <Table.Column
            title="Trạng thái"
            dataIndex="status"
            render={(status) => {
              let color = "default";
              if (status === "success") color = "green";
              else if (status === "pending") color = "orange";
              else if (status === "failed") color = "red";

              return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }}
          />
          <Table.Column
            title="Thời gian"
            dataIndex="createdAt"
            render={(createdAt) =>
              new Date(createdAt).toLocaleString("vi-VN")
            }
          />
        </Table>
      </Card>

      <Modal
        title="Thiết lập tài khoản nhận tiền"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleUpdateAccount} initialValues={wallet}>
          <Form.Item
            label="Nhà cung cấp"
            name="provider"
            rules={[{ required: true, message: "Chọn nhà cung cấp" }]}
          >
            <Input placeholder="momo hoặc vnpay" />
          </Form.Item>
          <Form.Item
            label="Số tài khoản / Số điện thoại"
            name="accountNumber"
            rules={[{ required: true, message: "Nhập số tài khoản" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SellerWallet;
