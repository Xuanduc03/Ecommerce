import React from 'react';
import styles from './ProductReview.module.scss';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface ProductReviewProps {
  reviews: Review[];
}

const ProductReview: React.FC<ProductReviewProps> = ({ reviews }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Đánh Giá Sản Phẩm</h2>
      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.userName}>{review.userName}</span>
              <div className={styles.rating}>
                {'⭐'.repeat(Math.floor(review.rating))}
                {review.rating % 1 !== 0 && '⭐'.slice(0, 1)}
                <span className={styles.ratingText}>({review.rating})</span>
              </div>
              <span className={styles.date}>{review.date}</span>
            </div>
            <p className={styles.comment}>{review.comment}</p>
            {review.images && review.images.length > 0 && (
              <div className={styles.imageGallery}>
                {review.images.map((img, index) => (
                  <img key={index} src={img} alt={`Review image ${index}`} className={styles.reviewImage} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReview;