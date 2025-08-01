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
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ProductCard, type ProductCardProps } from '../../Product/ProductCard';
import { ProductListSection } from '../../Product/ProductListSection';

interface FilterState {
  priceRange: [number, number];
  locations: string[];
  brands: string[];
  rating: number;
  inStock: boolean;
  hasDiscount: boolean;
}

interface Category {
  categoryId: string;
  name: string;
  productCount: number;
  subCategories?: Category[];
}

const sortOptions = [
  { value: 'popular', label: 'Phổ Biến', icon: TrendingUp },
  { value: 'newest', label: 'Mới Nhất', icon: Clock },
  { value: 'bestseller', label: 'Bán Chạy', icon: Zap },
  { value: 'price_asc', label: 'Giá: Thấp → Cao', icon: null },
  { value: 'price_desc', label: 'Giá: Cao → Thấp', icon: null },
  { value: 'rating', label: 'Đánh giá cao', icon: Star }
];

const API_URL = 'https://localhost:7040/api';

const CategoryProduct: React.FC = () => {
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [categories, setCategories] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  const { slug } = useParams<{ slug: string }>();

  // Safe token retrieval
  const getAuthToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError('');
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/categories/slug/${slug}`, {
          headers
        });

        const data = response.data.data || response.data;
        setCategories(data);

        // Auto-select first subcategory and fetch its products
        if (data?.subCategories?.length > 0) {
          const firstCategory = data.subCategories[0];
          setSelectedCategory(firstCategory.categoryId);
          await fetchProducts(firstCategory.categoryId);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
        setError('Không thể tải danh mục sản phẩm');
      }
    };

    if (slug) {
      fetchCategories();
    }
  }, [slug]);

  const fetchProducts = async (categoryId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/product/by-category/${categoryId}`, {
        headers
      });

      const data = response.data.data || response.data;

      const transformedProducts: ProductCardProps[] = data.map((item: any) => ({
        id: item.productId,
        name: item.productName,
        originalPrice: item.originalPrice,
        currentPrice: item.finalPrice || item.originalPrice,
        discount: item.discountPercent || 0,
        image: item.imageUrls?.[0] || '/images/default-product.jpg',
        badge: item.variants?.[0]?.brandNew ? 'Mới' : '',
        sold: 0, // API doesn't provide sales count
        rating: 4.5,
        isFlashSale: false,
        brand: item.subcategoryName || 'Unknown', // Use subcategoryName as brand
        category: item.categoryName || '', 
        inStock: (item.variants?.some((variant: any) => variant.stockQuantity > 0)) ?? true
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setError('Không thể tải sản phẩm');
      setProducts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 20000000],
    locations: [],
    brands: [],
    rating: 0,
    inStock: false,
    hasDiscount: false
  });

  const itemsPerPage = 12;

  const filterOptions = useMemo(() => {
    if (products.length === 0) {
      return {
        priceRange: { min: 0, max: 20000000 },
        brands: []
      };
    }
    
    return {
      priceRange: {
        min: Math.min(...products.map(p => p.currentPrice)),
        max: Math.max(...products.map(p => p.currentPrice))
      },
      brands: [...new Set(products.map(p => p.brand).filter(Boolean))]
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    result = result.filter(p => {
      const matchesPrice = p.currentPrice >= filters.priceRange[0] && p.currentPrice <= filters.priceRange[1];
      const matchesBrand = filters.brands.length === 0 || (p.brand && filters.brands.includes(p.brand));
      const matchesRating = p.rating >= filters.rating;
      const matchesStock = !filters.inStock || p.inStock;
      const matchesDiscount = !filters.hasDiscount || p.discount > 0;

      return matchesPrice && matchesBrand && matchesRating && matchesStock && matchesDiscount;
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
  }, [products, searchQuery, filters, sortBy]);

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

  // Clear filters - Updated
  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 50000000] as [number, number], // Set a reasonable default max
      locations: [],
      brands: [],
      rating: 0,
      inStock: false,
      hasDiscount: false
    };
    
    setFilters(defaultFilters);
  };

  // Initialize filters when products change
  useEffect(() => {
    if (products.length > 0 && filterOptions.priceRange.max > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max]
      }));
    }
  }, [filterOptions]);

  // Debug information - Enhanced
  useEffect(() => {

    // Debug individual product filtering
    if (products.length > 0) {
      console.log('=== FILTER DEBUG ===');
      products.forEach((product, index) => {
        const matchesPrice = product.currentPrice >= filters.priceRange[0] && product.currentPrice <= filters.priceRange[1];
        const matchesBrand = filters.brands.length === 0 || (product.brand && filters.brands.includes(product.brand));
        const matchesRating = product.rating >= filters.rating;
        const matchesStock = !filters.inStock || product.inStock;
        const matchesDiscount = !filters.hasDiscount || product.discount > 0;
        
        console.log(`Product ${index}:`, {
          name: product.name,
          currentPrice: product.currentPrice,
          brand: product.brand,
          rating: product.rating,
          inStock: product.inStock,
          discount: product.discount,
          filters: {
            priceRange: filters.priceRange,
            matchesPrice,
            matchesBrand,
            matchesRating,
            matchesStock,
            matchesDiscount
          },
          passesFilter: matchesPrice && matchesBrand && matchesRating && matchesStock && matchesDiscount
        });
      });
    }
  }, [categories, selectedCategory, products, filteredProducts, paginatedProducts, isLoading, error, searchQuery, filters, filterOptions]);

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
                {categories?.subCategories?.map((sub: any) => (
                  <button
                    key={sub.categoryId}
                    className={`category-item ${selectedCategory === sub.categoryId ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(sub.categoryId);
                      setCurrentPage(1);
                      fetchProducts(sub.categoryId);
                    }}
                  >
                    <span className="category-name">{sub.name}</span>
                    <span className="category-count">({sub.productCount})</span>
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

              {/* Brand Filter */}
              {filterOptions.brands.length > 0 && (
                <div className="filter-group">
                  <h4>Thương hiệu</h4>
                  {filterOptions.brands.map(brand => (
                    <label key={brand} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, brands: [...prev.brands, brand] }));
                          } else {
                            setFilters(prev => ({ ...prev, brands: prev.brands.filter(b => b !== brand) }));
                          }
                        }}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              )}

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
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => {
                  if (selectedCategory) {
                    fetchProducts(selectedCategory);
                  }
                }}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Content Header */}
            <div className="content-header">
              <div className="results-info">
                <h2>
                  {categories?.name || 'Sản phẩm'}
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
                <>

                  {/* Temporary simple product display for testing */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                </>
              ) : !error ? (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>Không tìm thấy sản phẩm</h3>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Debug: {products.length} products loaded, {filteredProducts.length} after filters
                  </div>
                </div>
              ) : null}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
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