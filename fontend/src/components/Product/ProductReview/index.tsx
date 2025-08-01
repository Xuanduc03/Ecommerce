import React, { useState } from 'react';
import { Star, ThumbsUp, Heart, X, Camera } from 'lucide-react';
import './ProductReview.scss';
import axios from 'axios';
import { toast } from 'react-toastify';

export interface Review {
  id: number;
  author: string;
  rating: number;
  content: string;
  likes: number;
  timeAgo: string;
  isVerified: boolean;
  isRecommended: boolean;
}

interface ProductReviewProps {
  productId: string;
  productName: string;
  productImage?: string;
  reviews: Review[];
  totalRating: number; 
  totalReviewCount: number; 
  totalSatisfied?: string; 
  onSubmitReview?: (review: {
    rating: number;
    comment: string;
    recommend: boolean;
    name: string;
    phone: string;
  }) => void;

  onReloadReviews?: () => void;
}

const API_URL = 'https://localhost:7040/api';
const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Tạm ổn', 'Tốt', 'Rất tốt'];

const ProductReview: React.FC<ProductReviewProps> = ({
  productId,
  productName,
  productImage,
  reviews,
  totalRating,
  totalReviewCount,
  totalSatisfied,
  onSubmitReview,
  onReloadReviews,
}) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [willRecommend, setWillRecommend] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('authUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.userId;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        size={16}
      />
    ));
  };

  const renderRatingBars = () => {
    const ratings = [
      { stars: 5, percentage: 99.9 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 }
    ];

    return ratings.map((rating) => (
      <div key={rating.stars} className="rating-bar-container">
        <span className="rating-number">{rating.stars}</span>
        <Star className="rating-star" size={12} />
        <div className="rating-bar">
          <div
            className="rating-fill"
            style={{ width: `${rating.percentage}%` }}
          ></div>
        </div>
        <span className="rating-percentage">{rating.percentage}%</span>
      </div>
    ));
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    if (!reviewerName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/review`, {
        userId,
        productId,
        rating: reviewRating,
        comment: reviewComment,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      toast('Cảm ơn bạn đã đánh giá sản phẩm!');
      setShowReviewModal(false);
      // Gọi callback reload reviews nếu có
      onReloadReviews?.();
    } catch (err) {
      toast.error('Gửi đánh giá thất bại!');
    } finally {
      setSubmitting(false);
      setReviewRating(0);
      setReviewComment('');
      setWillRecommend(false);
      setAgreeToPolicy(false);
      setReviewerName('');
      setReviewerPhone('');
    }
  };


  return (
    <div className="product-review">
      <div className="review-header">
        <h2 className="product-title">Đánh giá {productName}</h2>

        <div className="rating-summary">
          <div className="overall-rating">
            <div className="rating-score">
              <Star className="star filled" size={20} />
              <span className="score-number">{totalRating}</span>
              <span className="score-total">/5</span>
            </div>
            <div className="rating-info">
              {totalSatisfied && <div className="customer-count">{totalSatisfied}</div>}
              <div className="review-count">{totalReviewCount} đánh giá</div>
            </div>
          </div>

          <div className="rating-breakdown">
            {renderRatingBars()}
          </div>

          <div className="phone-preview">
            <div className="phone-screen">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="app-icon"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-author">
              <span className="author-name">{review.author}</span>
              {review.isVerified && (
                <span className="verified-badge">
                  ✓ Đã mua tại Shop
                </span>
              )}
            </div>

            <div className="review-rating">
              <div style={{ display: 'flex' }}>
                {renderStars(review.rating)}
              </div>
              {review.isRecommended && (
                <div className="recommend-badge">
                  <Heart size={14} fill="currentColor" />
                  Sẽ giới thiệu cho bạn bè, người thân
                </div>
              )}
            </div>

            <div className="review-content">
              {review.content}
            </div>

            <div className="review-footer">
              <button className="like-button">
                <ThumbsUp size={14} />
                Hữu ích ({review.likes})
              </button>
              <span>{review.timeAgo}</span>
            </div>
          </div>
        ))}

        <div className="action-buttons">
          <button
            className="btn btn-outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Thu gọn' : `Xem ${totalReviewCount} đánh giá`}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowReviewModal(true)}
          >
            Viết đánh giá
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Đánh giá sản phẩm</h3>
              <button
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="product-info">
                <div className="product-image">
                  {productImage ? (
                    <img src={productImage} alt={productName} style={{ width: 60, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                      borderRadius: '8px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '8px',
                        height: '8px',
                        background: '#333',
                        borderRadius: '50%'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        background: '#333',
                        borderRadius: '50%'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '3px',
                        background: '#333',
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  )}
                </div>
                <h4 className="product-name">{productName}</h4>
              </div>

              <div className="rating-section">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`rating-star-btn ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star size={28} />
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  {ratingLabels.slice(1).map((label, index) => (
                    <span
                      key={index}
                      className={`rating-label ${index + 1 === reviewRating ? 'active' : ''}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="comment-section">
                <textarea
                  className="comment-input"
                  placeholder="Mời bạn chia sẻ thêm cảm nhận..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="options-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={willRecommend}
                    onChange={(e) => setWillRecommend(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Tôi sẽ giới thiệu sản phẩm cho bạn bè, người thân
                </label>

                <button className="photo-upload-btn">
                  <Camera size={16} />
                  Gửi ảnh thực tế (tối đa 3 ảnh)
                </button>
              </div>

              <div className="contact-section">
                <div className="contact-inputs">
                  <input
                    type="text"
                    className="contact-input"
                    placeholder="Họ tên (bắt buộc)"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="contact-input"
                    placeholder="Số điện thoại (bắt buộc)"
                    value={reviewerPhone}
                    onChange={(e) => setReviewerPhone(e.target.value)}
                  />
                </div>

                <label className="checkbox-label policy-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeToPolicy}
                    onChange={(e) => setAgreeToPolicy(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Tôi đồng ý với <a href="#" className="policy-link">Chính sách xử lý dữ liệu cá nhân</a> của Thế Giới Di Động
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={!agreeToPolicy || submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              <div className="footer-links">
                <a href="#" className="footer-link">Quy định đánh giá</a>
                <span className="separator">|</span>
                <a href="#" className="footer-link">Chính sách bảo mật thông tin</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReview;