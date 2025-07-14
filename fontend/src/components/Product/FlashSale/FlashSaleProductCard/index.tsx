import React from 'react';
import './FlashSaleProduct.scss';

interface FlashSaleProduct {
  id: string;
  image: string;
  price: number;
  discountPercent: number;
  badgeText: string;
}

export const FlashSaleProductCard: React.FC<{ product: FlashSaleProduct }> = ({ product }) => {
  return (
    <div className="flash-sale-card">
      <div className="image-container">
        <img src={product.image} alt="Product" />
        <div className="mall-badge">Mall</div>
        <div className="discount">-{product.discountPercent}%</div>
      </div>
      <div className="info">
        <div className="price">₫{product.price.toLocaleString()}</div>
        <div className="badge">{product.badgeText}</div>
      </div>
    </div>
  );
};


