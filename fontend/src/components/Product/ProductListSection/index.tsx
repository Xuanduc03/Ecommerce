import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, type ProductCardProps } from '../ProductCard';
import './ProductListSection.scss';

interface ProductListSectionProps {
  title: string;
  products: ProductCardProps[];
  showPagination?: boolean;
  itemsPerPage?: number;
  layout?: 'grid' | 'list';
}

export const ProductListSection: React.FC<ProductListSectionProps> = ({
  title,
  products,
  showPagination = false,
  itemsPerPage = 6,
  layout = 'grid',
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    if (!showPagination) return products;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage, showPagination]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="product-list-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showPagination && totalPages > 1 && (
          <div className="pagination-info">
            Trang {currentPage} / {totalPages}
          </div>
        )}
      </div>

      <div className={`product-container ${layout}`}>
        {products.map((product) =>
          product ? <ProductCard key={product.id} product={product} /> : null
        )}

      </div>

      {showPagination && totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Trước
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
