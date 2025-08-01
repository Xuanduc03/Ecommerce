import React, { useEffect } from 'react';
import './ProductShopInfo.scss';
import { FaRocketchat, FaShopware, FaCalendarAlt, FaPhone, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface ShopInfo {
  shopId?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactPhone?: string;
  createdAt?: string;
}

interface ProductShopInfoProps {
  shop?: ShopInfo | null;
}

const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ shop }) => {
  useEffect(() => {
    console.log('Shop data:', shop);
  }, [shop]);
  const navigate = useNavigate();

  if (!shop) {
    return (
      <div className="product-shop-info">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Đang tải thông tin shop...</span>
        </div>
      </div>
    );
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading image:', e);
    e.currentTarget.src = 'https://via.placeholder.com/80/e0e0e0/999999?text=Shop';
  };

  const handleBannerError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading banner:', e);
    e.currentTarget.src = 'https://via.placeholder.com/400x150/f5f5f5/999999?text=Banner';
  };

  return (
    <div className="product-shop-info">
      <div className="shop-card">
        {/* Shop Header */}
        <div className="shop-header">
          <div className="shop-avatar">
            <img
              src={shop.logoUrl || 'https://via.placeholder.com/80/e0e0e0/999999?text=Shop'}
              alt={shop.name || 'Shop'}
              onError={handleImageError}
              className="shop-logo"
            />
          </div>
          
          <div className="shop-details">
            <h3 className="shop-name">{shop.name || 'Chưa có tên shop'}</h3>
            <p className="shop-description">{shop.description || 'Chưa có mô tả về shop'}</p>
            
            <div className="shop-meta">
              {shop.contactPhone && (
                <div className="meta-item">
                  <FaPhone className="meta-icon" />
                  <span>{shop.contactPhone}</span>
                </div>
              )}
              {shop.createdAt && (
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span>Tham gia {new Date(shop.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

           {/* Shop Banner */}
        {shop.bannerUrl && (
          <div className="shop-banner">
            <div className="banner-container">
              <img
                src={shop.bannerUrl}
                alt="Shop Banner"
                onError={handleBannerError}
                className="banner-image"
              />
              <div className="banner-overlay">
                <FaImage className="banner-icon" />
              </div>
            </div>
          
          </div>
        )}
        </div>

       

        {/* Action Buttons */}
        <div className="shop-actions">
          <button className="btn btn-chat">
            <FaRocketchat className="btn-icon" />
            <span>Chat Ngay</span>
          </button>
          <button className="btn btn-shop"
          onClick={() => navigate(`/shop/${shop.shopId}`)}>
            <FaShopware className="btn-icon" />
            <span>Xem Shop</span>
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default ProductShopInfo;