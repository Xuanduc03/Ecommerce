import React from 'react';
import { FlashSaleProductCard } from "../FlashSaleProductCard";
import './FlashSaleSection.scss';

interface FlashSaleProduct {
  id: string;
  image: string;
  price: number;
  discountPercent: number;
  badgeText: string;
}

interface FlashSaleSectionProps {
  products: FlashSaleProduct[];
  countdown?: string; // ví dụ "01:43:24"
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, countdown }) => {
  return (
    <div className="flash-sale-section">
      <div className="header">
        <h2>🔥 FLASH SALE</h2>
        {countdown && <span className="countdown">{countdown}</span>}
        <a className="view-all" href="/flash-sale">Xem tất cả &gt;</a>
      </div>

      <div className="product-list">
        {products.map(product => (
          <FlashSaleProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
