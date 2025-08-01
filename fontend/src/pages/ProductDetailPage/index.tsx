import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductDetail from '../../components/Product/ProductDetail';
import ProductShopInfo from '../../components/Product/ProductShopInfo';
import ProductReview from '../../components/Product/ProductReview';
import ProductDescription from '../../components/Product/ProductDetail/ProductDescription';
import { ProductListSection } from '../../components/Product/ProductListSection';
import type { ProductCardProps } from '../../components/Product/ProductCard';

const API_URL = 'https://localhost:7040/api';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductAndShop = async () => {
      try {
        const resProduct = await axios.get(`${API_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const productData = resProduct.data;
        setProduct(productData);

        // Lấy đánh giá sản phẩm nếu có API riêng
        if (productData?.productId) {
          try {
            const resReviews = await axios.get(`${API_URL}/review/product/${productData.productId}`);
            setReviews(resReviews.data || []);
          } catch {
            setReviews([]);
          }
        } else {
          setReviews([]);
        }

        if (productData?.shopId) {
          const resShop = await axios.get(`${API_URL}/shop/${productData.shopId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setShop(resShop.data);

          if (productData?.categoryId) {
            const resSuggested = await axios.get(`${API_URL}/product/suggested-by-category/${productData.categoryId}?count=8`);
            const data = resSuggested.data.data || resSuggested.data;
            const transformedProducts: ProductCardProps[] = data.map((item: any) => ({
              id: item.productId,
              name: item.productName,
              originalPrice: item.originalPrice,
              currentPrice: item.variants?.[0]?.price ?? item.originalPrice,
              discount: item.variants?.[0]
                ? Math.round(((item.originalPrice - item.variants[0].price) / item.originalPrice) * 100)
                : 0,
              image: item.imageUrls?.[0] || '/images/default-product.jpg',
              badge: item.variants?.[0]?.brandNew ? 'Mới' : '',
              sold: item.variants?.[0]?.salesCount || 0,
              rating: 4.5,
              isFlashSale: false
            }));
            setSuggestedProducts(transformedProducts);
          }

        }
      } catch (err) {
        setError('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndShop();

    return () => {
      setProduct(null);
      setShop(null);
      setReviews([]);
      setSuggestedProducts([]);
    };
  }, [id, token]);


  const handleSubmitReview = (review: any) => {
    setReviews(prev => [
      {
        ...review,
        id: Date.now(),
        author: review.name,
        rating: review.rating,
        content: review.comment,
        likes: 0,
        timeAgo: "Vừa xong",
        isVerified: false,
        isRecommended: review.recommend,
      },
      ...prev,
    ]);
  };

  if (loading) return <div>Đang tải chi tiết sản phẩm...</div>;
  if (error || !product) return <div>{error || 'Không có dữ liệu'}</div>;

  // Tính tổng điểm và số lượng đánh giá
  const totalRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;
  const totalReviewCount = reviews.length;

  return (
    <div>
      <ProductDetail
        productId={product.productId}
        productName={product.productName}
        price={product.variants?.[0]?.price ?? product.originalPrice ?? 0}
        originalPrice={product.originalPrice}
        imageUrls={product.imageUrls || []}
        rating={Number(totalRating)}
        reviewCount={totalReviewCount}
        shopId={product?.shopId}
        salesCount={product.variants?.[0]?.salesCount || 0}
        voucher={product.voucher || 'Giảm 10% cho đơn đầu'}
        shippingText="Miễn phí vận chuyển"
        assuranceText="Đổi trả 30 ngày"
        stock={product.variants?.[0]?.stockQuantity ?? 0}
        variants={product.variants || []}
        onAddToCart={() => console.log('Thêm giỏ hàng', product.productId)}
        onBuyNow={() => navigate(`/checkout?product=${product.productId}`)}
      />

      <ProductShopInfo shop={shop} />

      <ProductDescription
        variant={product.variants?.[0]}
        itemNumber={product.sku || "Mã-SP-Mặc-Định"}
        lastUpdated={product.lastUpdated || "N/A"}
        sellerName={shop?.shopName || "Shop Không Rõ Tên"}
        brand={product.brand || "Không rõ"}
        model={product.model || "Không rõ"}
        department={product.department || "Unisex"}
        category={product.categoryName || ["Chưa phân loại"]}
        material={product.material || "Không xác định"}
        fit={product.fit || "Vừa vặn"}
        style={product.style || "Cơ bản"}
        pattern={product.pattern || "Đơn sắc"}
        vintage={product.vintage ?? false}
        modifiedItem={product.modifiedItem ?? false}
        additionalFeatures={product.additionalFeatures || []}
        type={''}
      />

      <ProductReview
        productId={product.productId}
        productName={product.productName}
        productImage={product.imageUrls?.[0] || ""}
        reviews={reviews}
        totalRating={Number(totalRating)}
        totalReviewCount={totalReviewCount}
        totalSatisfied={product.totalSatisfied || "Chưa có dữ liệu"}
        onSubmitReview={handleSubmitReview}
      />

      {/* đề xuất sản phẩm theo danh mục */}
      <ProductListSection
        title="Sản phẩm liên quan"
        products={suggestedProducts}
        showPagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};