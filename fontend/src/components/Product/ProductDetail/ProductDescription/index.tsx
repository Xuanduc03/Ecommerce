import React, { useState } from 'react';
import './ProductDescription.scss';

export interface ProductVariant {
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

export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductDescriptionProps {
  variant: ProductVariant;
  itemNumber: string;
  lastUpdated: string;
  sellerName: string;
  brand: string;
  model: string;
  department: string;
  category: string[];
  material?: string;
  fit?: string;
  style?: string;
  pattern?: string;
  neckline?: string;
  vintage: boolean;
  modifiedItem: boolean;
  additionalFeatures: string[];
  type: string; // new: loại sản phẩm, ví dụ "Điện thoại", "Áo thun", ...
  dynamicSpecs?: SpecItem[]; // new: danh sách thông số kỹ thuật động cho từng loại sản phẩm
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  variant,
  itemNumber,
  lastUpdated,
  sellerName,
  brand,
  model,
  department,
  category,
  material,
  style,
  pattern,
  neckline,
  vintage,
  modifiedItem,
  additionalFeatures,
  type,
  dynamicSpecs = []
}) => {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

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

  const baseSpecifications: SpecItem[] = [
    { label: 'Tình trạng', value: variant.brandNew ? 'Mới 100%' : 'Đã qua sử dụng' },
    { label: 'Thương hiệu', value: brand },
    { label: 'Kích thước', value: variant.size },
    { label: 'Danh mục', value: Array.isArray(category) ? category.join(', ') : '' },
  ];

  if (material) baseSpecifications.push({ label: 'Chất liệu', value: material });
  if (neckline) baseSpecifications.push({ label: 'Cổ áo', value: neckline });

  const additionalSpecs: SpecItem[] = [
    { label: 'Đã bán', value: `${variant.salesCount} sản phẩm` },
    { label: 'Sản phẩm cũ', value: vintage ? 'Có' : 'Không' },
    { label: 'Đã chỉnh sửa', value: modifiedItem ? 'Có' : 'Không' },
    { label: 'Loại', value: type }
  ];


  return (
    <div className="product-description">
      <div className="description-header">
        <div className="tabs">
          {['about', 'specs', 'description'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'about' ? 'Thông tin sản phẩm' :
               tab === 'specs' ? 'Thông số kỹ thuật' : 'Mô tả từ người bán'}
            </button>
          ))}
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
            <p><strong>Người bán: {sellerName}</strong></p>
            <p>Cập nhật lần cuối vào {lastUpdated}</p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="specs-section">
            <h3>Thông số kỹ thuật sản phẩm</h3>
            <div className="specs-grid">
              <div className="specs-column">
                {baseSpecifications.map((spec, i) => (
                  <div key={i} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
              <div className="specs-column">
                {[...additionalSpecs, ...dynamicSpecs].map((spec, i) => (
                  <div key={i} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-stats">
              <div className="stat-card"><div className="stat-number">{variant.viewsCount}</div><div className="stat-label">Lượt xem</div></div>
              <div className="stat-card"><div className="stat-number">{variant.salesCount}</div><div className="stat-label">Đã bán</div></div>
              <div className="stat-card"><div className="stat-number">{variant.stockQuantity}</div><div className="stat-label">Tồn kho</div></div>
              <div className="stat-card"><div className="stat-number">{formatPrice(variant.price)}</div><div className="stat-label">Giá bán</div></div>
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div className="seller-description">
            <h3>Mô tả sản phẩm</h3>
            <div className="color-info">
              <div className="color-display">
                <div className="color-swatch" style={{ backgroundColor: variant.colorCode }}></div>
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
                  <button onClick={() => setShowAllFeatures(!showAllFeatures)}>
                    {showAllFeatures ? 'Thu gọn' : `Xem thêm ${featuresList.length - 5} tính năng`}
                  </button>
                )}
              </div>
            )}

            {additionalFeatures.length > 0 && (
              <div className="additional-features">
                <h5>Thông tin bổ sung:</h5>
                <ul>
                  {additionalFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
