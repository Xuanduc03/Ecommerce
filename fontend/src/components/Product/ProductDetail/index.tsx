import React, { useState } from 'react';
import './ProductDetail.scss';

interface Variant {
  variantId: string;
  colorName?: string;
  size?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

interface ProductDetailProps {
  productName: string;
  originalPrice?: number;
  imageUrls: string[];
  variants?: Variant[];
  reviewCount?: number;
  salesCount?: number;
  price: number;
  stock: number;
  voucher?: string;
  shippingText?: string;
  assuranceText?: string;
  rating?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productName,
  price,
  originalPrice,
  imageUrls,
  variants,
  reviewCount = 0,
  salesCount = 0,
  stock,
  voucher,
  shippingText = "Free shipping",
  assuranceText = "30-day return guarantee",
  rating = 4.5,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ color?: string; size?: string }>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
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
          {imageUrls.map((image, index) => (
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
            <img src={imageUrls[selectedImageIndex]} alt={productName} />
            <div className="image-controls">
              <button
                className="nav-btn prev"
                onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : imageUrls.length - 1)}
              >
                ❮
              </button>
              <button
                className="nav-btn next"
                onClick={() => setSelectedImageIndex(prev => prev < imageUrls.length - 1 ? prev + 1 : 0)}
              >
                ❯
              </button>
            </div>
            <div className="image-indicators">
              {imageUrls.map((_, index) => (
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
          <h1 className="product-title">{productName}</h1>
          <div className="seller-info">
            <div className="seller-avatar"><span>A</span></div>
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
          {originalPrice && (
            <div className="price-original">
              Giảm giá: <span className="original-price">{formatPrice(originalPrice)}</span>
            </div>
          )}
        </div>

        <div className="info__stats">
          <div className="stat-item">
            <span className="stat-label">Đánh giá:</span>
            <div className="rating-display">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <span className="rating-number">({rating})</span>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-label">Kho:</span>
            <span className="stock-count">Còn {stock}</span>
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
            {/* Hàng chọn màu */}
            <div className="variant-group">
              <label className="variant-label">Màu sắc:</label>
              <div className="variant-options">
                {[...new Set(variants.map(v => v.colorName))].map((color) => (
                  <button
                    key={color}
                    className={`variant-option ${selectedVariants.color === color ? 'selected' : ''}`}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, color }))}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Hàng chọn dung lượng (size) */}
            <div className="variant-group">
              <label className="variant-label">Dung lượng:</label>
              <div className="variant-options">
                {[...new Set(variants.map(v => v.size))].map((size) => (
                  <button
                    key={size}
                    className={`variant-option ${selectedVariants.size === size ? 'selected' : ''}`}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, size }))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


        <div className="info__quantity">
          <label className="quantity-label">Số lượng:</label>
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>-</button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min="1"
              max={stock}
            />
            <button className="quantity-btn" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= stock}>+</button>
          </div>
          <span className="sold-count">{salesCount} Đã bán</span>
        </div>

        <div className="info__actions">
          <button className="action-btn buy-now" onClick={onBuyNow}>Mua ngay nào!</button>
          <button className="action-btn add-to-cart" onClick={onAddToCart}>Thêm vào giỏ hàng</button>
          <button className="action-btn watchlist">♡ Yêu thích</button>
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
