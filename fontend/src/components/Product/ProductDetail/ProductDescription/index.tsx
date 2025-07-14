import React, { useState } from 'react';
import './ProductDescription.scss';

interface ProductVariant {
  productVariantId: string;
  productId: string;
  size: string;
  colorCode: string;
  colorName: string;
  stockQuantity: number;
  viewsCount: number;
  salesCount: number;
  brandNew: boolean;
  features: string;
  price: number;
  seoDescription: string;
}

interface ProductDescriptionProps {
  variant: ProductVariant;
  itemNumber?: string;
  lastUpdated?: string;
  sellerName?: string;
  brand?: string;
  model?: string;
  department?: string;
  category?: string[];
  material?: string;
  fit?: string;
  style?: string;
  pattern?: string;
  neckline?: string;
  vintage?: boolean;
  modifiedItem?: boolean;
  additionalFeatures?: string[];
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  variant,
  itemNumber = "253531066697",
  lastUpdated = "11 Jul, 2025 23:18:41 PDT",
  sellerName = "Người bán",
  brand = "Champion",
  model = "T425",
  department = "Nam",
  category = ["Quần áo, Giày dép & Phụ kiện", "Quần áo Nam", "Áo phông", "Áo thun"],
  material = "100% Cotton hoặc Cotton Blend",
  fit = "Regular",
  style = "Áo thun cơ bản",
  pattern = "Trơn",
  neckline = "Cổ tròn",
  vintage = false,
  modifiedItem = false,
  additionalFeatures = []
}) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return features.split('\n').filter(f => f.trim());
    }
  };

  const featuresList = parseFeatures(variant.features);
  const displayFeatures = showAllFeatures ? featuresList : featuresList.slice(0, 5);

  const specifications = [
    { label: 'Tình trạng', value: variant.brandNew ? 'Mới với thẻ: Sản phẩm hoàn toàn mới và chưa từng được sử dụng' : 'Đã qua sử dụng' },
    { label: 'Độ dài tay áo', value: 'Tay ngắn' },
    { label: 'Chất liệu', value: material },
    { label: 'Cổ áo', value: neckline },
    { label: 'Thương hiệu', value: brand },
    { label: 'Phòng ban', value: department },
    { label: 'Mẫu', value: model },
    { label: 'Kích thước', value: variant.size },
    { label: 'Danh mục', value: category.join(' > ') }
  ];

  const additionalSpecs = [
    { label: 'Kiểu dáng', value: pattern },
    { label: 'Đã bán', value: `${variant.salesCount} sản phẩm` },
    { label: 'Sản phẩm cũ', value: vintage ? 'Có' : 'Không' },
    { label: 'Đã chỉnh sửa', value: modifiedItem ? 'Có' : 'Không' },
    { label: 'Kiểu dáng', value: fit },
    { label: 'Kích thước', value: fit },
    { label: 'Loại', value: 'Áo thun' },
    { label: 'Phong cách', value: style }
  ];

  return (
    <div className="product-description">
      <div className="description-header">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Thông tin sản phẩm
          </button>
          <button 
            className={`tab ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Thông số kỹ thuật
          </button>
          <button 
            className={`tab ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả từ người bán
          </button>
        </div>
        
        <div className="item-meta">
          <div className="meta-item">
            <span className="label">Mã sản phẩm:</span>
            <span className="value">{itemNumber}</span>
          </div>
          <div className="meta-item">
            <span className="label">Cập nhật lần cuối:</span>
            <span className="value">{lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="description-content">
        {activeTab === 'about' && (
          <div className="about-section">
            <div className="seller-info">
              <p><strong>Người bán chịu trách nhiệm đầy đủ cho danh mục này.</strong></p>
              <p>Cập nhật lần cuối vào {lastUpdated} <a href="#" className="view-revisions">Xem tất cả các phiên bản</a></p>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="specs-section">
            <h3>Thông số kỹ thuật sản phẩm</h3>
            <div className="specs-grid">
              <div className="specs-column">
                {specifications.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="specs-column">
                {additionalSpecs.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-stats">
              <div className="stat-card">
                <div className="stat-number">{variant.viewsCount.toLocaleString()}</div>
                <div className="stat-label">Lượt xem</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{variant.salesCount.toLocaleString()}</div>
                <div className="stat-label">Đã bán</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{variant.stockQuantity}</div>
                <div className="stat-label">Tồn kho</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{formatPrice(variant.price)}</div>
                <div className="stat-label">Giá bán</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div className="seller-description">
            <h3>Mô tả sản phẩm từ người bán</h3>
            <div className="product-title">
              <h4>{brand} {model} Áo thun {neckline} tay ngắn cho {department}</h4>
            </div>
            
            <div className="product-details">
              <div className="color-info">
                <div className="color-display">
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: variant.colorCode }}
                  ></div>
                  <span className="color-name">{variant.colorName}</span>
                </div>
                <div className="size-info">
                  <span className="size-label">Kích thước:</span>
                  <span className="size-value">{variant.size}</span>
                </div>
              </div>

              {variant.seoDescription && (
                <div className="seo-description">
                  <p>{variant.seoDescription}</p>
                </div>
              )}

              {featuresList.length > 0 && (
                <div className="features-list">
                  <h5>Đặc điểm nổi bật:</h5>
                  <ul>
                    {displayFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  
                  {featuresList.length > 5 && (
                    <button 
                      className="show-more-btn"
                      onClick={() => setShowAllFeatures(!showAllFeatures)}
                    >
                      {showAllFeatures ? 'Thu gọn' : `Xem thêm ${featuresList.length - 5} tính năng khác`}
                    </button>
                  )}
                </div>
              )}

              {additionalFeatures && additionalFeatures.length > 0 && (
                <div className="additional-features">
                  <h5>Thông tin bổ sung:</h5>
                  <ul>
                    {additionalFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="product-highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>Chất liệu cao cấp</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>Thoáng mát, thấm hút mồ hôi</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>Đường may chắc chắn</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>Cổ áo không bị giãn</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">✓</span>
                  <span>Logo thương hiệu trên tay áo</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;