
import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryProduct.scss';
import { ProductCard, type ProductCardProps } from '../../Product/ProductCard';
import type { Product } from '../../../types/product';

// Mock data cho sản phẩm
const mockProducts = [
  {
    id: 1,
    name: 'Loa bluetooth không dây mini A005 đèn led',
    originalPrice: 43000,
    currentPrice: 27000,
    discount: 49,
    image: '/api/placeholder/200/200',
    badge: 'Yêu thích',
    sold: 27,
    rating: 4.5,
    isFlashSale: false
  },
  {
    id: 2,
    name: 'CLUBLU- Jack Chuyển Đổi Type-C Sang 3.5mm',
    originalPrice: 10000,
    currentPrice: 7400,
    discount: 50,
    image: '/api/placeholder/200/200',
    badge: 'Yêu thích',
    sold: 74,
    rating: 4.7,
    isFlashSale: false
  },
  {
    id: 3,
    name: 'Loa toàn dải J Go 2 Go 3 Go 4 5 inch 17inch 3W',
    originalPrice: 28000,
    currentPrice: 22400,
    discount: 20,
    image: '/api/placeholder/200/200',
    badge: '',
    sold: 34,
    rating: 4.3,
    isFlashSale: false
  },
  {
    id: 4,
    name: 'Loa Di Động Bluetooth JBL Go 4 7 inch tối ưu',
    originalPrice: 1170000,
    currentPrice: 936000,
    discount: 2,
    image: '/api/placeholder/200/200',
    badge: 'Bán chạy',
    sold: 40,
    rating: 4.8,
    isFlashSale: true
  },
  {
    id: 5,
    name: 'Loa bluetooth không dây mini A005 đèn led',
    originalPrice: 9500,
    currentPrice: 7100,
    discount: 68,
    image: '/api/placeholder/200/200',
    badge: 'Yêu thích',
    sold: 71,
    rating: 4.6,
    isFlashSale: false
  },
  {
    id: 6,
    name: 'Loa bluetooth mini công suất 5W',
    originalPrice: 45000,
    currentPrice: 36000,
    discount: 20,
    image: '/api/placeholder/200/200',
    badge: '',
    sold: 23,
    rating: 4.4,
    isFlashSale: false
  }
];

const categories = [
  'Thiết Bị Điện Tử',
  'Thiết bị đeo thông minh',
  'Phụ kiện tivi',
  'Máy Game Console',
  'Phụ kiện Console',
  'Đĩa game',
  'Linh phụ kiện',
  'Tai nghe phát nhạc',
  'Loa',
  'Tivi',
  'Tivi Box',
  'Headphones'
];
const CategoryProduct: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Loa');
  const [sortBy, setSortBy] = useState<string>('Phổ Biến');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<ProductCardProps[]>(mockProducts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulate API call
  const fetchProducts = async (category: string, sort: string, page: number): Promise<void> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setProducts(mockProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts(selectedCategory, sortBy, currentPage);
  }, [selectedCategory, sortBy, currentPage]);

  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string): void => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="ecommerce-page">
      <div className="container">
        <div className="page-layout">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="category-section">
              <h2 className="section-title">
                <Grid className="icon" />
                Tất Cả Danh Mục
              </h2>
              <ul className="category-list">
                {categories.map((category) => (
                  <li 
                    key={category}
                    className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="filter-section">
              <h3 className="filter-title">
                <Filter className="icon" />
                BỘ LỌC TÌM KIẾM
              </h3>
              <div className="filter-item">
                <h4>Nơi Bán</h4>
                <div className="filter-options">
                  <label>
                    <input type="checkbox" />
                    Hà Nội
                  </label>
                  <label>
                    <input type="checkbox" />
                    TP. Hồ Chí Minh
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {/* Header */}
            <div className="content-header">
              <div className="sort-options">
                <span>Sắp xếp theo</span>
                <div className="sort-buttons">
                  {['Phổ Biến', 'Mới Nhất', 'Bán Chạy', 'Giá'].map((option) => (
                    <button
                      key={option}
                      className={`sort-btn ${sortBy === option ? 'active' : ''}`}
                      onClick={() => handleSortChange(option)}
                    >
                      {option}
                      {option === 'Giá' && <ChevronDown className="icon" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pagination-info">
                <span>1/8</span>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="icon" />
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight className="icon" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
              {isLoading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProduct;