import React from 'react';
import './ProductShopInfo.scss';
import { FaRocketchat, FaShopware } from 'react-icons/fa';

interface ProductShopInfoProps {
  warehouse: number;
  brand: string;
  location: string;
  breadcrumbs: string[];
  shop: {
    name: string;
    rating: string;
    responseRate: string;
    products: number;
    responseTime: string;
    joined: string;
    followers: string;
    vouchers?: { value: string; condition: string; expiry: string }[];
  };
}

const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ shop }) => {
  return (
    <div className="product-shop-info">
      <div className="shop-summary">
        <div className="shop-status">
          <div className="shop-image">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" // Placeholder Apple logo
              alt={shop.name}
            />
            <span className="shopee-mall">Shopee Mall</span>
          </div>
          <div className="shop-info">
            <div className="shop-name">
              {shop.name} <span className="shop-subtitle">Authorised Reseller</span>
              <br />
              <span className="shop-online">Online 6 Giờ Trước</span>
            </div>
            <div className="shop-link">
              <button className="shop-chat">
                <FaRocketchat /> Chat Ngay
              </button>
              <button className="shop-view">
                <FaShopware /> Xem Shop
              </button>
            </div>
          </div>
        </div>
        <div className="shop-stats">
          <span>
            Đánh Giá: <strong>{shop.rating}</strong>
          </span>
          <span>
            Tỉ Lệ Phản Hồi: <strong>{shop.responseRate}</strong>
          </span>
          <span>
            Sản Phẩm: <strong>{shop.products}</strong>
          </span>
          <span>
            Thời Gian Phản Hồi: <strong>{shop.responseTime}</strong>
          </span>
          <span>
            Tham Gia: <strong>{shop.joined}</strong>
          </span>
          <span>
            Người Theo Dõi: <strong>{shop.followers}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductShopInfo;