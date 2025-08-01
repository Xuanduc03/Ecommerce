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
} from 'antd';
import {
  StarFilled,
  ShoppingFilled,
  MessageFilled,
} from '@ant-design/icons';
import moment, {type Moment } from 'moment';
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
  const [dateRange, setDateRange] = useState<[Moment, Moment]>([
    moment().startOf('month'),
    moment().endOf('month'),
  ]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const token = localStorage.getItem('authToken');

    const fetchShopForSeller = async () => {
    try {
      const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const seller = sellerRes.data;
      if (!seller?.sellerId) return message.error("Không tìm thấy thông tin seller!");

      const shopRes = await axios.get(`https://localhost:7040/api/shop/seller/${seller.sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shop = shopRes.data;
      if (!shop?.shopId) return message.error("Seller chưa có cửa hàng!");

      setShopId(shop.shopId);
      console.log("shop", shop.shopId);
    } catch {
      message.error("Không thể tải thông tin Shop cho seller!");
    }
  };

  useEffect(() => {
    fetchShopForSeller();
  }, []);


  const fetchReviewsByShop = async (
    shopId: string,
    productId: string | null = null,
    startDate: Moment | null = null,
    endDate: Moment | null = null
  ) => {
    try {
      setLoading(true);
      const params: any = {};
      if (productId) params.productId = productId;
      if (startDate) params.startDate = startDate.format('YYYY-MM-DD');
      if (endDate) params.endDate = endDate.format('YYYY-MM-DD');

      const response = await axios.get<Review[]>(`https://localhost:7040/api/review/shop/${shopId}`, {
        params,
      });

      setReviews(response.data);

      if (response.data.length > 0) {
        const avgRating =
          response.data.reduce((sum, r) => sum + r.rating, 0) /
          response.data.length;

        setStats((prev) => ({
          ...prev,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: response.data.length,
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          averageRating: 0,
          totalReviews: 0,
        }));
      }
    } catch (error: any) {
      message.error('Lỗi khi tải đánh giá: ' + error.message);
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
      setProducts(response.data || []);
      setStats((prev) => ({
        ...prev,
        totalProducts: response.data.length,
      }));
    } catch (error: any) {
      message.error('Lỗi khi tải sản phẩm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      render: (id: string) =>
        products.find((p) => p.productId === id)?.name || 'N/A',
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
      title: 'Ngày đánh giá',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  console.log("Products:", products);


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

              onChange={(dates) => {
                if (dates) setDateRange(dates as [Moment, Moment]);
              }}
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
            .sort(
              (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
            )
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
                        <Rate
                          disabled
                          defaultValue={product.averageRating || 0}
                        />
                        <div>
                          Giá: {product.price?.toLocaleString() || '0'}đ
                        </div>
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
