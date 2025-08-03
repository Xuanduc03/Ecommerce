import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Rate,
  Tag,
  Statistic,
  Select,
  DatePicker,
  Divider,
  message,
  Input,
  Button,
} from 'antd';
import {
  StarFilled,
  ShoppingFilled,
  MessageFilled,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Product {
  productId: string;
  name: string;
  averageRating?: number;
  imageUrl?: string;
  price?: number;
  soldQuantity?: number;
}

interface Review {
  reviewId: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createAt: string;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
}

interface Stats {
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
}

const ProductReviewPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});

  const token = localStorage.getItem('authToken');
  console.log('Auth Token:', token); // Debug log

  const fetchShopForSeller = async () => {
    try {
      const sellerRes = await axios.get('https://localhost:7040/api/seller/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      if (!seller?.sellerId) return message.error('Không tìm thấy thông tin seller!');

      setSellerId(seller.sellerId);
      const shopRes = await axios.get(`https://localhost:7040/api/shop/seller/${seller.sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = shopRes.data;
      if (!shop?.shopId) return message.error('Seller chưa có cửa hàng!');

      setShopId(shop.shopId);
    } catch (error: any) {
      message.error('Không thể tải thông tin Shop cho seller: ' + (error.response?.data?.error || error.message));
    }
  };

  const fetchReviewsByShop = async (
    shopId: string,
    productId: string | null = null,
    startDate: Dayjs | null = null,
    endDate: Dayjs | null = null,
    pageNumber: number = 1,
    pageSize: number = 10
  ) => {
    try {
      setLoading(true);
      const params: any = { pageNumber, pageSize };
      if (productId) params.productId = productId;
      if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
      if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

      const response = await axios.get(`https://localhost:7040/api/review/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log('API Response:', response.data); // Debug log
      // Xử lý trường hợp API trả về mảng trực tiếp hoặc { data: [...] }
      const reviewsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setReviews(reviewsData);

      if (reviewsData.length > 0) {
        const avgRating =
          reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewsData.length;
        setStats((prev) => ({
          ...prev,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: reviewsData.length,
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          averageRating: 0,
          totalReviews: 0,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error.response?.data || error.message);
      message.error('Lỗi khi tải đánh giá: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchShopProducts = async (shopId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://localhost:7040/api/product/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Products Response:', response.data); // Debug log
      setProducts(response.data || []);
      setStats((prev) => ({
        ...prev,
        totalProducts: response.data.length,
      }));
    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message);
      message.error('Lỗi khi tải sản phẩm: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (reviewId: string) => {
    const reply = replyInput[reviewId];
    if (!reply) {
      message.error('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `https://localhost:7040/api/review/reply/${sellerId}`,
        { reviewId, reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(response.data.message);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === reviewId
            ? { ...r, sellerReply: response.data.data.sellerReply, sellerReplyAt: response.data.data.sellerReplyAt }
            : r
        )
      );
      setReplyInput((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error: any) {
      message.error('Lỗi khi thêm phản hồi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(`https://localhost:7040/api/review/reply/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(response.data.message);
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === reviewId
            ? { ...r, sellerReply: null, sellerReplyAt: null }
            : r
        )
      );
    } catch (error: any) {
      message.error('Lỗi khi xóa phản hồi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopForSeller();
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchShopProducts(shopId);
      fetchReviewsByShop(shopId);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) {
      fetchReviewsByShop(shopId, selectedProduct, dateRange[0], dateRange[1]);
    }
  }, [selectedProduct, dateRange, shopId]);

  const filteredReviews = selectedProduct
    ? reviews.filter((r) => r.productId === selectedProduct)
    : reviews;

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'product',
      render: (id: string) => {
        const product = products.find((p) => p.productId === id);
        return product ? product.name : 'N/A';
      },
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Phản hồi của Seller',
      dataIndex: 'sellerReply',
      key: 'sellerReply',
      render: (sellerReply: string | null, record: Review) => (
        <div>
          {sellerReply ? (
            <>
              <p>{sellerReply}</p>
              <p style={{ color: '#888', fontSize: '12px' }}>
                {record.sellerReplyAt
                  ? dayjs(record.sellerReplyAt).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </p>
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                onClick={() => handleDeleteReply(record.reviewId)}
                disabled={loading}
              >
                Xóa phản hồi
              </Button>
            </>
          ) : (
            <div>
              <Input
                value={replyInput[record.reviewId] || ''}
                onChange={(e) =>
                  setReplyInput((prev) => ({ ...prev, [record.reviewId]: e.target.value }))
                }
                placeholder="Nhập phản hồi..."
                style={{ marginBottom: '8px' }}
                disabled={loading}
                maxLength={500}
              />
              <Button
                type="primary"
                onClick={() => handleAddReply(record.reviewId)}
                disabled={loading}
              >
                Gửi phản hồi
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Thống kê & Đánh giá sản phẩm</h1>

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số sản phẩm"
              value={stats.totalProducts}
              prefix={<ShoppingFilled />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={stats.averageRating}
              prefix={<StarFilled />}
              decimalSeparator=","
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số đánh giá"
              value={stats.totalReviews}
              prefix={<MessageFilled />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Bộ lọc" style={{ marginBottom: '20px' }} loading={loading}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn sản phẩm"
              allowClear
              onChange={(value) => setSelectedProduct(value || null)}
              loading={loading}
              value={selectedProduct || undefined}
            >
              {products.map((product) => (
                <Option key={product.productId} value={product.productId}>
                  {product.name} (⭐ {product.averageRating?.toFixed(1) || '0'})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
              disabled={loading}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Danh sách đánh giá" loading={loading}>
        <Table
          columns={columns}
          dataSource={filteredReviews}
          rowKey="reviewId"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Divider />

      <Card title="Top sản phẩm được đánh giá cao">
        <Row gutter={16}>
          {products
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 3)
            .map((product) => (
              <Col span={8} key={product.productId}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: '160px',
                        background: '#f0f2f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        'Hình ảnh sản phẩm'
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <>
                        <Rate disabled defaultValue={product.averageRating || 0} />
                        <div>Giá: {product.price?.toLocaleString() || '0'}đ</div>
                        <div>Đã bán: {product.soldQuantity || 0}</div>
                        <Tag color="gold">Top Rated</Tag>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
        </Row>
      </Card>
    </div>
  );
};

export default ProductReviewPage;