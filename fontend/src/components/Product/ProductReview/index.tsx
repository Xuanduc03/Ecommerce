import React, { useState } from 'react';
import { Star, ThumbsUp, Heart, X, Camera } from 'lucide-react';
import './ProductReview.scss'

interface Review {
  id: number;
  author: string;
  rating: number;
  content: string;
  likes: number;
  timeAgo: string;
  isVerified: boolean;
  isRecommended: boolean;
}

const ProductReview : React.FC = () => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [willRecommend, setWillRecommend] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');

  const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Tạm ổn', 'Tốt', 'Rất tốt'];

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }
    if (!reviewerName.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    // Xử lý gửi đánh giá ở đây
    console.log('Đánh giá:', {
      rating: reviewRating,
      comment: reviewComment,
      recommend: willRecommend,
      name: reviewerName,
      phone: reviewerPhone
    });

    // Reset form và đóng modal
    setReviewRating(0);
    setReviewComment('');
    setWillRecommend(false);
    setAgreeToPolicy(false);
    setReviewerName('');
    setReviewerPhone('');
    setShowReviewModal(false);

    alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    const reviews: Review[] = [
      {
        id: 1,
        author: "Lê Bảo",
        rating: 5,
        content: "Máy sử dụng sau 1 tuần rất ok, không có vấn đề. Chỉ có khung viền bám vân tay dây ổ và khi gắn ốp lưng vào cũng má sát với ốp gây ổ mất thẩm mỹ. Không biết nếu vét ổ độ để lâu mới về sinh thì khung viền có trở lại bình thường không bỉ nghệ thuật luôn. Chưa tình đến việc thao ốp ra nhiều lần có ảnh hưởng đến biến dạng kết cấu máy không vì ốp rất cứng.",
        likes: 27,
        timeAgo: "Đã dùng khoảng 1 tuần",
        isVerified: true,
        isRecommended: true
      },
      {
        id: 2,
        author: "Quân",
        rating: 5,
        content: "Sau 1 tuần sử dụng thì thấy khá tốt. Rất mượt. Pin dùng liên tục cũng cả ngày. Trước giờ chưa dùng ip nên k có gì để so sánh.",
        likes: 35,
        timeAgo: "Đã dùng khoảng 6 ngày",
        isVerified: true,
        isRecommended: true
      }
    ];

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

    return (
      <div className="product-review">
        <div className="review-header">
          <h2 className="product-title">Đánh giá Điện thoại iPhone 16 Pro 256GB</h2>

          <div className="rating-summary">
            <div className="overall-rating">
              <div className="rating-score">
                <Star className="star filled" size={20} />
                <span className="score-number">4.9</span>
                <span className="score-total">/5</span>
              </div>
              <div className="rating-info">
                <div className="customer-count">21,3k khách hài lòng</div>
                <div className="review-count">13 đánh giá</div>
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
                    ✓ Đã mua tại TGDĐ
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
              {showAllReviews ? 'Thu gọn' : 'Xem 13 đánh giá'}
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
                  </div>
                  <h4 className="product-name">Điện thoại iPhone 16 Plus 128GB</h4>
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
                  disabled={!agreeToPolicy}
                >
                  Gửi đánh giá
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
  };}

  export default ProductReview;