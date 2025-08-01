import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShopHeader from '../../components/Shop/ShopHeader';
import { useParams } from 'react-router-dom';
import './ShopPage.scss';
import { toast } from 'react-toastify';
import { ProductListSection } from '../../components/Product/ProductListSection';
import type { ProductCardProps } from '../../components/Product/ProductCard';

interface ShopData {
  shopId: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating?: number;
  totalReviews?: number;
  totalProducts?: number;
  followers?: number;
  joinDate?: string;
  description?: string;
}

const ShopPage: React.FC = () => {
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const { shopId } = useParams<{ shopId: string }>();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await axios.get(`https://localhost:7040/api/shop/${shopId}`);
        setShopData(response.data);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };
    if (shopId) fetchShopData();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://localhost:7040/api/product/shop/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data || response.data;

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
          rating: 4.5, // nếu API chưa có rating thì hardcode
          isFlashSale: false
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shopId]);


  return (
    <div className="shop-page">
      {shopData && (
        <ShopHeader shopInfo={shopData} />
      )}

      {shopData?.bannerUrl && (
        <div className="shop-banner">
          <img src={shopData.bannerUrl} alt="Shop Banner" className="w-full h-64 object-cover rounded-md" />
        </div>
      )}

      <div className="shop-content">
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <ProductListSection
            title="Sản phẩm của cửa hàng"
            products={products}
            showPagination={true}
            itemsPerPage={8}
          />
        )}
      </div>
    </div>
  );
};

export default ShopPage;
