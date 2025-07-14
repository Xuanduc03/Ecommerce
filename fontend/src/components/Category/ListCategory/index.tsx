import React from 'react';
import styles from './ListCategory.module.scss';

interface CategoryItem {
  name: string;
  image: string;
  link?: string;
}

interface ListCategoryProps {
  categories: CategoryItem[];
}

export const ListCategory: React.FC<ListCategoryProps> = ({ categories }) => {
  return (
    <div className={styles.category_grid}>
      <h2 className={styles.title}>Browse by categories</h2>
      <div className={styles.grid}>
        {categories.map((item, index) => (
          <a href={item.link || '#'} key={index} className={styles.category_item}>
            <div className={styles.image_wrapper}>
              <img src={item.image} alt={item.name} />
            </div>
            <div className={styles.name}>{item.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
};
