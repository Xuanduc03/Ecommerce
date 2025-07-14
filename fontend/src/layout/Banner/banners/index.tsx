import React from 'react';
import styles from './Banners.module.scss';

interface BannerProduct {
  image: string;
  label: string;
  link: string;
}

interface BannerContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  products: BannerProduct[];
  backgroundColor: string;
}

interface BannersProps {
  banner: BannerContent;
}

const Banners: React.FC<BannersProps> = ({ banner }) => {
  return (
    <div
      className={styles.sliderWrapper}
      style={{ backgroundColor: banner.backgroundColor, borderRadius: '24px' }}
    >
      <div className={styles.contentLeft}>
        <h2 className={styles.title}>{banner.title}</h2>
        <p className={styles.subtitle}>{banner.subtitle}</p>
        <a href={banner.buttonLink} className={styles.shopBtn}>
          {banner.buttonText}
        </a>
      </div>
      <div className={styles.productImages}>
        {banner.products.map((item, idx) => (
          <a key={idx} href={item.link} className={styles.productItem}>
            <img src={item.image} alt={item.label} />
            <span>{item.label} &rsaquo;</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Banners;