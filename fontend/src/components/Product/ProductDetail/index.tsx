import React, { useState } from 'react';
import './ProductDetail.scss';

interface Variant {
  id: string;
  name: string;
  value: string;
  image?: string;
}

interface ProductDetailProps {
  title: string;
  price: number;
  originalPrice?: number;
  discountText?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  media: string[];
  voucher?: string;
  shippingText?: string;
  assuranceText?: string;
  variants?: Variant[];
  stock: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  title,
  price,
  originalPrice,
  discountText,
  rating = 4.8,
  reviewCount = 142,
  soldCount = 159,
  media,
  voucher,
  shippingText = "Free shipping",
  assuranceText = "30-day return guarantee",
  variants,
  stock,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price * 25000);
  };

  const handleVariantChange = (variantId: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantId]: value
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-detail__gallery">
        <div className="gallery__thumbnails">
          {media.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img src={image} alt={`Product view ${index + 1}`} />
            </div>
          ))}
        </div>
        
        <div className="gallery__main">
          <div className="main-image">
            <img src={media[selectedImageIndex]} alt={title} />
            <div className="image-controls">
              <button 
                className="nav-btn prev"
                onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : media.length - 1)}
              >
                ❮
              </button>
              <button 
                className="nav-btn next"
                onClick={() => setSelectedImageIndex(prev => prev < media.length - 1 ? prev + 1 : 0)}
              >
                ❯
              </button>
            </div>
            <div className="image-indicators">
              {media.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail__info">
        <div className="info__header">
          <h1 className="product-title">{title}</h1>
          
          <div className="seller-info">
            <div className="seller-avatar">
              <span>A</span>
            </div>
            <div className="seller-details">
              <div className="seller-name">Antonline</div>
              <div className="seller-stats">
                <span className="rating">99% positive</span>
                <span className="reviews">({reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info__pricing">
          <div className="price-main">{formatPrice(price)}</div>
          <div className="price-vnd">Approximately {formatVND(price)}</div>
          
          {originalPrice && (
            <div className="price-original">
              <span className="original-price">{formatPrice(originalPrice)}</span>
              {discountText && <span className="discount-badge">{discountText}</span>}
            </div>
          )}
        </div>

        <div className="info__stats">
          <div className="stat-item">
            <span className="stat-label">Rating:</span>
            <div className="rating-display">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-number">({rating})</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Condition:</span>
            <span className="condition-badge">New</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Stock:</span>
            <span className="stock-count">{stock} available</span>
          </div>
        </div>

        {voucher && (
          <div className="info__voucher">
            <div className="voucher-badge">
              <span className="voucher-icon">🎫</span>
              <span className="voucher-text">{voucher}</span>
            </div>
          </div>
        )}

        {variants && variants.length > 0 && (
          <div className="info__variants">
            {variants.map((variant) => (
              <div key={variant.id} className="variant-group">
                <label className="variant-label">{variant.name}:</label>
                <div className="variant-options">
                  <button
                    className={`variant-option ${selectedVariants[variant.id] === variant.value ? 'selected' : ''}`}
                    onClick={() => handleVariantChange(variant.id, variant.value)}
                  >
                    {variant.value}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="info__quantity">
          <label className="quantity-label">Quantity:</label>
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min="1"
              max={stock}
            />
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>
          <span className="sold-count">{soldCount} sold</span>
        </div>

        <div className="info__actions">
          <button className="action-btn buy-now" onClick={onBuyNow}>
            Buy It Now
          </button>
          <button className="action-btn add-to-cart" onClick={onAddToCart}>
            Add to Cart
          </button>
          <button className="action-btn watchlist">
            ♡ Add to Watchlist
          </button>
        </div>

        <div className="info__features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">People want this. {reviewCount} people are watching this.</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔥</span>
            <span className="feature-text">This one's trending. {soldCount} have already sold.</span>
          </div>
        </div>

        <div className="info__shipping">
          <div className="shipping-item">
            <span className="shipping-icon">🚚</span>
            <span className="shipping-text">{shippingText}</span>
          </div>
          <div className="shipping-item">
            <span className="shipping-icon">🛡️</span>
            <span className="shipping-text">{assuranceText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 