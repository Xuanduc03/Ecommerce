import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  X,
  ChevronUp
} from 'lucide-react';
import './CategoryProduct.scss';

// Types
interface Product {
  id: number;
  name: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  image: string;
  badge: string;
  sold: number;
  rating: number;
  isFlashSale: boolean;
  category: string;
  location: string;
  brand: string;
  inStock: boolean;
}

interface FilterState {
  priceRange: [number, number];
  locations: string[];
  brands: string[];
  rating: number;
  inStock: boolean;
  hasDiscount: boolean;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Loa bluetooth không dây mini A005 đèn led RGB cao cấp',
    originalPrice: 43000,
    currentPrice: 27000,
    discount: 49,
    image: '/api/placeholder/300/300',
    badge: 'Yêu thích',
    sold: 127,
    rating: 4.5,
    isFlashSale: false,
    category: 'Loa',
    location: 'Hà Nội',
    brand: 'TechSound',
    inStock: true
  },
  {
    id: 2,
    name: 'CLUBLU- Jack Chuyển Đổi Type-C Sang 3.5mm chất lượng cao',
    originalPrice: 10000,
    currentPrice: 7400,
    discount: 26,
    image: '/api/placeholder/300/300',
    badge: 'Bán chạy',
    sold: 274,
    rating: 4.7,
    isFlashSale: false,
    category: 'Phụ kiện',
    location: 'TP. Hồ Chí Minh',
    brand: 'CLUBLU',
    inStock: true
  },
  {
    id: 3,
    name: 'Loa toàn dải J Go 2 Go 3 Go 4 5 inch 17inch 3W chuyên nghiệp',
    originalPrice: 28000,
    currentPrice: 22400,
    discount: 20,
    image: '/api/placeholder/300/300',
    badge: '',
    sold: 89,
    rating: 4.3,
    isFlashSale: false,
    category: 'Loa',
    location: 'Đà Nẵng',
    brand: 'JBL',
    inStock: true
  },
  {
    id: 4,
    name: 'Loa Di Động Bluetooth JBL Go 4 7 inch tối ưu âm thanh',
    originalPrice: 1170000,
    currentPrice: 936000,
    discount: 20,
    image: '/api/placeholder/300/300',
    badge: 'Hot',
    sold: 156,
    rating: 4.8,
    isFlashSale: true,
    category: 'Loa',
    location: 'Hà Nội',
    brand: 'JBL',
    inStock: true
  },
  {
    id: 5,
    name: 'Tai nghe bluetooth không dây mini A005 pin 8h',
    originalPrice: 95000,
    currentPrice: 71000,
    discount: 25,
    image: '/api/placeholder/300/300',
    badge: 'Mới',
    sold: 203,
    rating: 4.6,
    isFlashSale: false,
    category: 'Tai nghe',
    location: 'TP. Hồ Chí Minh',
    brand: 'SoundMax',
    inStock: false
  },
  {
    id: 6,
    name: 'Loa bluetooth mini công suất 5W chống nước IPX7',
    originalPrice: 45000,
    currentPrice: 36000,
    discount: 20,
    image: '/api/placeholder/300/300',
    badge: '',
    sold: 67,
    rating: 4.4,
    isFlashSale: false,
    category: 'Loa',
    location: 'Hà Nội',
    brand: 'Anker',
    inStock: true
  },
  {
    id: 7,
    name: 'Máy chơi game cầm tay Nintendo Switch OLED',
    originalPrice: 8900000,
    currentPrice: 7800000,
    discount: 12,
    image: '/api/placeholder/300/300',
    badge: 'Premium',
    sold: 45,
    rating: 4.9,
    isFlashSale: true,
    category: 'Console',
    location: 'TP. Hồ Chí Minh',
    brand: 'Nintendo',
    inStock: true
  },
  {
    id: 8,
    name: 'Tivi Samsung 4K 55 inch Smart TV 2024',
    originalPrice: 15000000,
    currentPrice: 12500000,
    discount: 17,
    image: '/api/placeholder/300/300',
    badge: 'Cao cấp',
    sold: 23,
    rating: 4.7,
    isFlashSale: false,
    category: 'Tivi',
    location: 'Hà Nội',
    brand: 'Samsung',
    inStock: true
  }
];

const categories = [
  { name: 'Tất cả', count: 234, icon: Grid },
  { name: 'Loa', count: 89, icon: null },
  { name: 'Tai nghe', count: 156, icon: null },
  { name: 'Tivi', count: 45, icon: null },
  { name: 'Console', count: 23, icon: null },
  { name: 'Phụ kiện', count: 67, icon: null },
  { name: 'Tivi Box', count: 34, icon: null },
  { name: 'Thiết bị âm thanh', count: 78, icon: null }
];

const sortOptions = [
  { value: 'popular', label: 'Phổ Biến', icon: TrendingUp },
  { value: 'newest', label: 'Mới Nhất', icon: Clock },
  { value: 'bestseller', label: 'Bán Chạy', icon: Zap },
  { value: 'price_asc', label: 'Giá: Thấp → Cao', icon: null },
  { value: 'price_desc', label: 'Giá: Cao → Thấp', icon: null },
  { value: 'rating', label: 'Đánh giá cao', icon: Star }
];

const CategoryProduct: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 20000000],
    locations: [],
    brands: [],
    rating: 0,
    inStock: false,
    hasDiscount: false
  });

  const itemsPerPage = 12;

  // Get unique values for filters
  const filterOptions = useMemo(() => ({
    locations: [...new Set(mockProducts.map(p => p.location))],
    brands: [...new Set(mockProducts.map(p => p.brand))],
    priceRange: {
      min: Math.min(...mockProducts.map(p => p.currentPrice)),
      max: Math.max(...mockProducts.map(p => p.currentPrice))
    }
  }), []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = mockProducts;

    // Category filter
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    result = result.filter(p => {
      const matchesPrice = p.currentPrice >= filters.priceRange[0] && p.currentPrice <= filters.priceRange[1];
      const matchesLocation = filters.locations.length === 0 || filters.locations.includes(p.location);
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(p.brand);
      const matchesRating = p.rating >= filters.rating;
      const matchesStock = !filters.inStock || p.inStock;
      const matchesDiscount = !filters.hasDiscount || p.discount > 0;

      return matchesPrice && matchesLocation && matchesBrand && matchesRating && matchesStock && matchesDiscount;
    });

    // Sort products
    switch (sortBy) {
      case 'newest':
        result = [...result].reverse();
        break;
      case 'bestseller':
        result = [...result].sort((a, b) => b.sold - a.sold);
        break;
      case 'price_asc':
        result = [...result].sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default: // popular
        result = [...result].sort((a, b) => (b.sold * b.rating) - (a.sold * a.rating));
    }

    return result;
  }, [selectedCategory, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max],
      locations: [],
      brands: [],
      rating: 0,
      inStock: false,
      hasDiscount: false
    });
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className={`product-card ${viewMode === 'list' ? 'list-view' : ''}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.isFlashSale && (
          <div className="flash-sale-badge">
            <Zap size={12} />
            Flash Sale
          </div>
        )}
        {product.badge && (
          <div className={`product-badge ${product.badge.toLowerCase()}`}>
            {product.badge}
          </div>
        )}
        {product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
        <div className="product-actions">
          <button className="action-btn">
            <Heart size={16} />
          </button>
          <button className="action-btn">
            <Eye size={16} />
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < Math.floor(product.rating) ? 'filled' : ''}
              />
            ))}
            <span className="rating-text">({product.rating})</span>
          </div>
          <span className="sold-count">Đã bán {product.sold}</span>
        </div>

        <div className="product-price">
          <span className="current-price">{formatPrice(product.currentPrice)}</span>
          {product.originalPrice > product.currentPrice && (
            <span className="original-price">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="product-meta">
          <div className="location">
            <MapPin size={12} />
            <span>{product.location}</span>
          </div>
          <div className="brand">
            <span>{product.brand}</span>
          </div>
        </div>

        <button className="add-to-cart-btn">
          <ShoppingCart size={16} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );

  return (
    <div className="category-product-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="search-section">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="header-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
              {(filters.locations.length > 0 || filters.brands.length > 0 || filters.rating > 0 || filters.inStock || filters.hasDiscount) && (
                <span className="filter-count">
                  {[...filters.locations, ...filters.brands, filters.rating > 0 ? 1 : 0, filters.inStock ? 1 : 0, filters.hasDiscount ? 1 : 0].filter(Boolean).length}
                </span>
              )}
            </button>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="page-layout">
          {/* Sidebar */}
          <div className={`sidebar ${showFilters ? 'show-mobile' : ''}`}>
            {/* Categories */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Danh mục sản phẩm</h3>
              </div>
              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setCurrentPage(1);
                    }}
                  >
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Bộ lọc</h3>
                <button className="clear-filters" onClick={clearFilters}>
                  <X size={14} />
                  Xóa tất cả
                </button>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Khoảng giá</h4>
                <div className="price-range">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value), prev.priceRange[1]]
                    }))}
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)]
                    }))}
                  />
                  <div className="price-values">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="filter-group">
                <h4>Nơi bán</h4>
                {filterOptions.locations.map(location => (
                  <label key={location} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            locations: [...prev.locations, location]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            locations: prev.locations.filter(l => l !== location)
                          }));
                        }
                      }}
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>

              {/* Brand */}
              <div className="filter-group">
                <h4>Thương hiệu</h4>
                {filterOptions.brands.map(brand => (
                  <label key={brand} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            brands: [...prev.brands, brand]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            brands: prev.brands.filter(b => b !== brand)
                          }));
                        }
                      }}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>

              {/* Rating */}
              <div className="filter-group">
                <h4>Đánh giá</h4>
                {[5, 4, 3, 2, 1].map(rating => (
                  <label key={rating} className="radio-item">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => setFilters(prev => ({ ...prev, rating }))}
                    />
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < rating ? 'filled' : ''} />
                      ))}
                      <span>trở lên</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Other filters */}
              <div className="filter-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  />
                  <span>Còn hàng</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.hasDiscount}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasDiscount: e.target.checked }))}
                  />
                  <span>Đang giảm giá</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Content Header */}
            <div className="content-header">
              <div className="results-info">
                <h2>
                  {selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory}
                  <span className="count">({filteredProducts.length} sản phẩm)</span>
                </h2>
              </div>

              <div className="sort-section">
                <span>Sắp xếp theo:</span>
                <div className="sort-options">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.icon && <option.icon size={14} />}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`product-grid ${viewMode}`}>
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>Không tìm thấy sản phẩm</h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                
                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="mobile-filter-overlay" onClick={() => setShowFilters(false)}>
          <div className="mobile-filter-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-header">
              <h3>Bộ lọc</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProduct;