import React from 'react'
import { Carousel } from '../../layout/Banner/carousel';
import { ListCategory } from '../../components/Category/ListCategory';
import { ProductListSection } from '../../components/Product/ProductListSection';
import banner1 from "../../assets/images/banner1.webp";
import banner2 from "../../assets/images/banner2.webp";
import banner3 from "../../assets/images/banner3.webp";
import banner4 from "../../assets/images/banner4.webp";
import banner5 from "../../assets/images/banner5.webp";

import category1 from "../../assets/images/category1.jpg";
import category2 from "../../assets/images/category2.jpg";
import category3 from "../../assets/images/category3.jpg";
import category4 from "../../assets/images/category4.jpg";
import category5 from "../../assets/images/category5.jpg";
import category6 from "../../assets/images/category6.jpg";
import category7 from "../../assets/images/category7.jpg";
import flashSale1 from "../../assets/images/flashsale1.webp";

import product1 from "../../assets/images/product1.png";
import { FlashSaleSection } from '../../components/Product/FlashSale/FlashSaleSection';


const slides = [
  {
    title: 'Top tech for your ride',
    description: 'Explore in-car entertainment, GPS, security devices, and more.',
    buttonText: 'Shop now',
    backgroundColor: '#00b9c6',
    items: [
      {
        image: banner1,
        label: 'Entertainment',
      },
      {
        image: banner2,
        label: 'GPS',
      },
      {
        image: banner3,
        label: 'Security devices',
      },
    ],
  },
  {
    title: 'Home essentials',
    description: 'Discover kitchenware, furniture, and home decor.',
    buttonText: 'Shop now',
    backgroundColor: '#ff6f61',
    items: [
      {
        image: banner4,
        label: 'Kitchenware',
      },
      {
        image: banner5,
        label: 'Furniture',
      },
      {
        image: banner1,
        label: 'Home decor',
      },
    ],
  },
  // Add more slides as needed

];

const categories = [
  {
    name: 'New Electronics',
    image: category1,
    link: '/category/electronics',
  },
  {
    name: 'Collectibles',
    image: category2,
    link: '/category/collectibles',
  },
  {
    name: 'Parts & Accessories',
    image: category3,
    link: '/category/parts',
  },
  {
    name: 'Fashion',
    image: category4,
    link: '/category/fashion',
  },
  {
    name: 'Health & Beauty',
    image: category5,
    link: '/category/health',
  },
  {
    name: 'Home & Garden',
    image: category6,
    link: '/category/home',
  },
  {
    name: 'Refurbished',
    image: category7,
    link: '/category/refurbished',
  },
];


export const Home: React.FC = () => {
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
            badgeText: 'ĐANG BÁN CHẠY',
          },
          {
            id: '2',
            image: '/images/cream.png',
            price: 265000,
            discountPercent: 32,
            badgeText: 'ĐANG BÁN 33',
          },
          // ...
        ]}
      />

      <ProductListSection
  title="GỢI Ý HÔM NAY"
  products={[
     {
    id: 1,
    name: 'Loa Bluetooth Mini A005 Đèn LED',
    originalPrice: 100000,
    currentPrice: 75000,
    discount: 25,
    image: '/images/products/loa-a005.jpg',
    badge: 'Yêu thích',
    sold: 120,
    rating: 4.5,
    isFlashSale: false
  },
  {
    id: 2,
    name: 'Tai Nghe Chụp Tai Gaming RGB X7',
    originalPrice: 350000,
    currentPrice: 290000,
    discount: 17,
    image: '/images/products/tai-nghe-x7.jpg',
    badge: 'Bán chạy',
    sold: 340,
    rating: 4.8,
    isFlashSale: true
  },
  {
    id: 3,
    name: 'Jack Chuyển Đổi Type-C Sang 3.5mm',
    originalPrice: 40000,
    currentPrice: 29000,
    discount: 28,
    image: '/images/products/jack-typec.jpg',
    badge: '',
    sold: 87,
    rating: 4.1,
    isFlashSale: false
  },
  {
    id: 4,
    name: 'Tivi Box Android 4K 2024 Mới Nhất',
    originalPrice: 890000,
    currentPrice: 799000,
    discount: 10,
    image: '/images/products/tivi-box.jpg',
    badge: 'Mới về',
    sold: 45,
    rating: 4.6,
    isFlashSale: true
  },
  {
    id: 5,
    name: 'Loa Di Động JBL Go 4 Chính Hãng',
    originalPrice: 1170000,
    currentPrice: 936000,
    discount: 20,
    image: '/images/products/jbl-go-4.jpg',
    badge: 'Ưa chuộng',
    sold: 410,
    rating: 4.9,
    isFlashSale: true
  },
  {
    id: 6,
    name: 'Tai Nghe Bluetooth Xiaomi Air 2 SE',
    originalPrice: 690000,
    currentPrice: 540000,
    discount: 22,
    image: '/images/products/xiaomi-air2.jpg',
    badge: '',
    sold: 130,
    rating: 4.3,
    isFlashSale: false
  },
  {
    id: 7,
    name: 'Đồng Hồ Thông Minh Mi Band 8',
    originalPrice: 800000,
    currentPrice: 660000,
    discount: 17,
    image: '/images/products/miband8.jpg',
    badge: 'Giảm sốc',
    sold: 210,
    rating: 4.7,
    isFlashSale: true
  },
  {
    id: 8,
    name: 'Loa Kéo Bluetooth Karaoke 15 Inch',
    originalPrice: 3200000,
    currentPrice: 2680000,
    discount: 16,
    image: '/images/products/loa-keo.jpg',
    badge: 'Hot',
    sold: 54,
    rating: 4.2,
    isFlashSale: false
  },
  {
    id: 9,
    name: 'Webcam Full HD 1080P Cho Máy Tính',
    originalPrice: 500000,
    currentPrice: 420000,
    discount: 16,
    image: '/images/products/webcam-hd.jpg',
    badge: '',
    sold: 98,
    rating: 4.4,
    isFlashSale: false
  },
  {
    id: 10,
    name: 'Cáp Sạc Nhanh Type-C Dài 1.5m',
    originalPrice: 75000,
    currentPrice: 49000,
    discount: 35,
    image: '/images/products/cap-sac.jpg',
    badge: 'Yêu thích',
    sold: 230,
    rating: 4.6,
    isFlashSale: false
  }

  ]}
/>

    </div>
  )
}