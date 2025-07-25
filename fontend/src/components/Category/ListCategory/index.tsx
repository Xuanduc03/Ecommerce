import React from 'react';
import styles from './ListCategory.module.scss';

interface CategoryItem {
  name: string;
  image: string;
  link?: string;
}

interface ListCategoryProps {
  categories: CategoryItem[];
  title?: string;
  columns?: number;
  onCategoryClick?: (category: CategoryItem) => void;
}

export const ListCategory: React.FC<ListCategoryProps> = ({
  categories,
  title = 'Danh mục',
  columns = 4,
  onCategoryClick,
}) => {
  const handleClick = (e: React.MouseEvent, category: CategoryItem) => {
    if (!category.link) {
      e.preventDefault();
    }
    onCategoryClick?.(category);
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      
      <div 
        className={styles.grid} 
        style={{ '--grid-columns': columns } as React.CSSProperties}
      >
        {categories.map((category, index) => (
          <div key={`${category.name}-${index}`} className={styles.gridItem}>
            <a
              href={category.link || '#'}
              className={styles.categoryLink}
              onClick={(e) => handleClick(e, category)}
              aria-label={`Browse ${category.name} category`}
            >
              <div className={styles.imageContainer}>
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className={styles.categoryImage}
                />
              </div>
              <span className={styles.categoryName}>{category.name}</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};