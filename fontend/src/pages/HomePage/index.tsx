import React, { useState, useEffect } from 'react';
import { Carousel } from '../../layout/Banner/carousel';
import { ListCategory } from '../../components/Category/ListCategory';
import { ProductListSection } from '../../components/Product/ProductListSection';
import { FlashSaleSection } from '../../components/Product/FlashSale/FlashSaleSection';
import banner1 from "../../assets/images/banner1.webp";
import banner2 from "../../assets/images/banner2.webp";
import banner3 from "../../assets/images/banner3.webp";
import banner4 from "../../assets/images/banner4.webp";
import banner5 from "../../assets/images/banner5.webp";
import flashSale1 from "../../assets/images/flashsale1.webp";
import axios from 'axios';
import type { ApiResponse } from '../../redux/categorySlice';
import type { ProductCardProps } from '../../components/Product/ProductCard';

const API_URL = 'https://localhost:7040/api';
const slides = [
  {
    title: 'Top tech for your ride',
    description: 'Explore in-car entertainment, GPS, security devices, and more.',
    buttonText: 'Shop now',
    backgroundColor: '#00b9c6',
    items: [
      { image: banner1, label: 'Entertainment' },
      { image: banner2, label: 'GPS' },
      { image: banner3, label: 'Security devices' }
    ]
  },
  {
    title: 'Home essentials',
    description: 'Discover kitchenware, furniture, and home decor.',
    buttonText: 'Shop now',
    backgroundColor: '#ff6f61',
    items: [
      { image: banner4, label: 'Kitchenware' },
      { image: banner5, label: 'Furniture' },
      { image: banner1, label: 'Home decor' }
    ]
  }
];

export const Home: React.FC = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data.data || response.data;

        const transformedCategories = data
          .filter((item: any) => item.parentCategoryId === null)
          .map((item: any) => ({
            name: item.name,
            image: item.imageUrl,
            link: `/category/${item.slug}`
          }));
        setCategories(transformedCategories);
      } catch {
        setError('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/product`, {
          headers: { Authorization: `Bearer ${token}` }
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
      } catch {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Carousel
        slides={slides}
        autoPlay={true}
        interval={4000}
        showArrows={true}
        showIndicators={true}
      />

      <ListCategory categories={categories} />

      <FlashSaleSection
        countdown="01:43:24"
        products={[
          {
            id: '1',
            image: flashSale1,
            price: 738000,
            discountPercent: 44,
            badgeText: 'ĐANG BÁN CHẠY'
          }
        ]}
      />

      <ProductListSection
        title="GỢI Ý HÔM NAY"
        products={products} 
        showPagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};
