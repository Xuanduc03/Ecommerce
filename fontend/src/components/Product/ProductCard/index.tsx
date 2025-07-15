import React from 'react';
import './ProductCard.scss';
import { useNavigate } from 'react-router-dom';

export interface ProductCardProps {
  id: number;
  name: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  image: string;
  badge?: string; 
  sold: number;
  rating: number;
  isFlashSale?: boolean; 
}

export const ProductCard: React.FC<{ product: ProductCardProps }> = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.discount > 0 && (
          <div className="discount-badge">-{product.discount}%</div>
        )}
        {product.badge && (
          <div className={`product-badge ${product.badge === 'Bán chạy' ? 'hot' : 'favorite'}`}>
            {product.badge}
          </div>
        )}
        {product.isFlashSale && (
          <div className="flash-sale-badge">
            <span>Flash Sale 12:00 Thứ 5</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="current-price">₫{product.currentPrice.toLocaleString()}</span>
          {product.originalPrice > product.currentPrice && (
            <span className="original-price">₫{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="product-stats">
          <span className="sold">Đã bán {product.sold}k</span>
          <div className="rating">
            <span>★★★★★</span>
            <span className="rating-value">({product.rating})</span>
          </div>
        </div>
      </div>
    </div>
  );
};