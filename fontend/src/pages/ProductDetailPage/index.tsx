import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Product } from '../../types/product';
import ProductDetail from '../../components/Product/ProductDetail';
import ProductShopInfo from '../../components/Product/ProductShopInfo';
import ProductReview from '../../components/Product/ProductReview';
import ProductDescription from '../../components/Product/ProductDetail/ProductDescription';


const productData = {
    title: "Lenovo Legion 5 15.1\" OLED 165Hz AMD Ryzen 7 260 16GB RAM 512GB SSD RTX 5060",
    price: 1199.99,
    originalPrice: 1399.99,
    discountText: "14% off",
    rating: 4.8,
    reviewCount: 142,
    soldCount: 159,
    media: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&h=400&fit=crop"
    ],
    voucher: "Free shipping on orders over $999",
    shippingText: "Free 2-day shipping",
    assuranceText: "30-day return guarantee",
    variants: [
      {
        id: "storage",
        name: "Storage",
        value: "512GB SSD"
      },
      {
        id: "color",
        name: "Color",
        value: "Phantom Black"
      }
    ],
    stock: 25,
    onAddToCart: () => {
      console.log("Added to cart!");
      alert("Product added to cart!");
    },
    onBuyNow: () => {
      console.log("Buy now clicked!");
      alert("Redirecting to checkout...");
    }
  };


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
export const Products: React.FC = () => {

  const { id } = useParams();
  const [products, setProducts] = useState<Product | null>(null);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const responseProduct = await axios.get<{ data: Product }>(`http://localhost:8080/api/product/${id}`);
        setProducts(responseProduct.data.data);
      } catch (error) {
        console.error("Lấy sản phẩm ko thành công", error);
      }
    };

    fetchProduct();
  }, [id]);


  
  return (
    <div>
      <ProductDetail {...productData} />


      <ProductShopInfo
        warehouse={4247}
        brand="Apple"
        location="Bắc Ninh"
        breadcrumbs={['Shopee', 'Điện Thoại & Phụ Kiện', 'Điện thoại', 'Apple']}
        shop={{
          name: 'Apple Flagship Store',
          rating: '124,7k',
          responseRate: '100%',
          products: 548,
          responseTime: 'trong vài phút',
          joined: '7 năm trước',
          followers: '758,7k',
          vouchers: [
            {
              value: '300k',
              condition: '₫0',
              expiry: '31.07.2025',
            },
          ],
        }}
      />

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
      {/* <ProductReview reviews={sampleReviews} /> */}

    </div>
  )
}