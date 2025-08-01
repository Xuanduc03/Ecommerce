import React from 'react';
import './ShopHeader.scss';

interface ShopInfo {
  shopId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  rating?: number;
  totalReviews?: number;
  totalProducts?: number;
  followers?: number;
  joinDate?: string;
}

interface ShopHeaderProps {
  shopInfo: ShopInfo;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ shopInfo }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <header className="shop-header">
      <div className="shop-header__container">
        <div className="shop-header__main">
          {/* Shop Logo */}
          <div className="shop-header__logo">
            {shopInfo.logoUrl ? (
              <img src={shopInfo.logoUrl} alt={`${shopInfo.name} logo`} />
            ) : (
              <span className="shop-header__logo--placeholder">🏪</span>
            )}
          </div>

          {/* Shop Info */}
          <div className="shop-header__info">
            <h1 className="shop-header__name">{shopInfo.name}</h1>

            <div className="shop-header__stats">
              <div className="shop-header__stat shop-header__stat--positive">
                <strong>{shopInfo.rating || 99.4}%</strong> positive feedback
              </div>
              <div className="shop-header__stat">
                <strong>{formatNumber(shopInfo.totalProducts || 134)}</strong> items sold
              </div>
              <div className="shop-header__stat">
                <strong>{formatNumber(shopInfo.followers || 2800)}</strong> followers
              </div>
            </div>

            {shopInfo.description && (
              <p className="shop-header__description">{shopInfo.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="shop-header__actions">
            <button className="shop-header__btn">📤 Share</button>
            <button className="shop-header__btn">📞 Contact</button>
            <button className="shop-header__btn shop-header__btn--primary">❤️ Save Seller</button>
          </div>
        </div>

        {/* Tab navigation (nếu muốn thêm sau này) */}
        {/* 
        <ul className="shop-header__tabs">
          <li onClick={() => handleTabClick('products')}>🛒 Products</li>
          <li onClick={() => handleTabClick('feedback')}>💬 Feedback</li>
        </ul>
        */}

        {/* Search */}
        <div className="shop-header__search">
          <input
            type="text"
            placeholder={`Search all ${shopInfo.totalProducts || 134} items`}
          />
          <span className="shop-header__search__icon">🔍</span>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
