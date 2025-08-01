import React from 'react';
import './ListShop.scss';
import { useNavigate } from 'react-router-dom';

interface ShopInfo {
  shopId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactPhone?: string;
  createdAt?: string;
}

interface ShopListingProps {
  shops: ShopInfo[];
}

const ShopListing: React.FC<ShopListingProps> = ({ shops }) => {
  const navigate = useNavigate();

  const handleShopClick = (shop: ShopInfo) => {
    console.log(`Clicked on ${shop.name}`);
    navigate(`/shop/${shop.shopId}`);
  };

  return (
    <div className="best-selling-brands">
      <h2 className="best-selling-brands__title">Shop tốt nhất cho bạn</h2>
      
      <div className="best-selling-brands__grid">
        {shops.map((shop) => (
          <div
            key={shop.shopId}
            className="best-selling-brands__item"
            onClick={() => handleShopClick(shop)}
            role="button"
            tabIndex={0}
          >
            <div className="best-selling-brands__logo">
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} />
              ) : (
                <span className="best-selling-brands__logo--emoji">
                  🏪
                </span>
              )}
            </div>
            <p className="best-selling-brands__name">{shop.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopListing;