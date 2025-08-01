import React from 'react';
import './ProductCard.scss';
import { useNavigate } from 'react-router-dom';

export interface ProductCardProps {
  inStock: boolean;
  brand: any;
  category: string | null;
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
  features?: string[];
}

export const ProductCard: React.FC<{ product: ProductCardProps }> = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {/* Product Image */}
      <div className="product-image">
        <img src={product.image} alt={product.name} />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Product Name */}
        <h3 className="product-name">{product.name}</h3>

        {/* Features */}
        {product.features && (
          <div className="product-features">
            {product.features.join(' • ')}
          </div>
        )}

        {/* Price Section */}
        <div className="price-section">
          <div className="current-price">
            {product.currentPrice.toLocaleString()}₫
          </div>

          {product.originalPrice > product.currentPrice && (
            <div className="price-discount">
              <span className="original-price">
                {product.originalPrice.toLocaleString()}₫
              </span>
              <span className="discount-percent">
                -{product.discount}%
              </span>
            </div>
          )}
        </div>

        {/* Gift Info */}
        <div className="gift-info">
          Quà <strong>500.000₫</strong>
        </div>

        {/* Rating and Sales */}
        <div className="product-stats">
          <span className="rating">
            ★ {product.rating}
          </span>
          <span className="sold">
            • Đã bán {product.sold}k
          </span>
        </div>
      </div>
    </div>
  );
};