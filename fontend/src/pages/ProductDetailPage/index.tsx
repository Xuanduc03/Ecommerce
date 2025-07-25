import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Product } from '../../types/product';
import ProductDetail from '../../components/Product/ProductDetail';
import ProductShopInfo from '../../components/Product/ProductShopInfo';
import ProductReview from '../../components/Product/ProductReview';
import ProductDescription from '../../components/Product/ProductDetail/ProductDescription';
import { toast } from 'react-toastify';

const API_URL = 'https://localhost:7040/api';

const sampleProductVariant = {
  productVariantId: "550e8400-e29b-41d4-a716-446655440000",
  productId: "550e8400-e29b-41d4-a716-446655440001",
  size: "L",
  colorCode: "#2C3E50",
  colorName: "Xanh Navy",
  stockQuantity: 25,
  viewsCount: 1247,
  salesCount: 159,
  brandNew: true,
  features: JSON.stringify([
    "Vải cotton 100% cao cấp",
    "Độ bền cao, không co rút sau khi giặt",
    "Thấm hút mồ hôi tốt",
    "Đường may chắc chắn, tỉ mỉ",
    "Cổ áo không bị giãn theo thời gian",
    "Logo thương hiệu trên tay áo trái",
    "Có thể giặt máy ở nhiệt độ 30°C",
    "Phù hợp cho cả nam và nữ",
    "Thiết kế đơn giản, dễ phối đồ",
    "Chất liệu thoáng mát, phù hợp thời tiết Việt Nam"
  ]),
  price: 450000,
  seoDescription: "Áo thun Champion T425 chất lượng cao với thiết kế cổ điển, chất liệu cotton 100% thoáng mát, phù hợp cho mọi hoạt động hàng ngày. Sản phẩm chính hãng với độ bền cao và form dáng chuẩn."
};
export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

      if (productData?.shopId) {
        const resShop = await axios.get(`${API_URL}/shop/${productData.shopId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShop(resShop.data);
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
  };
}, [id, token]);


  if (loading) return <div>Đang tải chi tiết sản phẩm...</div>;
  if (error || !product) return <div>{error || 'Không có dữ liệu'}</div>;


  return (
    <div>
      <ProductDetail
        productName={product.productName}
        price={product.variants?.[0]?.price ?? product.originalPrice ?? 0}
        originalPrice={product.originalPrice}
        imageUrls={product.imageUrls || []}
        rating={4.5}
        reviewCount={product.reviewCount || 0}
        salesCount={product.variants?.[0]?.salesCount || 0}
        voucher={product.voucher || 'Giảm 10% cho đơn đầu'}
        shippingText="Miễn phí vận chuyển"
        assuranceText="Đổi trả 30 ngày"
        stock={product.variants?.[0]?.stockQuantity ?? 0}
        variants={product.variants || []}  // giữ nguyên interface Variant
        onAddToCart={() => console.log('Thêm giỏ hàng', product.productId)}
        onBuyNow={() => navigate(`/checkout?product=${product.productId}`)}
      />

      <ProductShopInfo shop={shop} />

      <ProductDescription
        variant={sampleProductVariant}
        itemNumber="253531066697"
        lastUpdated="11 Jul, 2025 23:18:41 PDT"
        sellerName="Shop Thời Trang ABC"
        brand="Champion"
        model="T425"
        department="Nam"
        category={["Quần áo, Giày dép & Phụ kiện", "Quần áo Nam", "Áo phông", "Áo thun"]}
        material="100% Cotton hoặc Cotton Blend (Chi tiết trong mô tả)"
        fit="Regular"
        style="Áo thun cơ bản"
        pattern="Trơn"
        neckline="Cổ tròn"
        vintage={false}
        modifiedItem={false}
        additionalFeatures={[
          "Có thể giặt máy",
          "Không sử dụng chất tẩy",
          "Phơi khô tự nhiên",
          "Là ở nhiệt độ thấp"
        ]}
      />
      <ProductReview />

    </div>
  )
}