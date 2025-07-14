// CartItem.tsx
import React from "react";
import classNames from "classnames/bind";
import styles from "./CartItem.module.scss";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

export interface CartItemProps {
  item: {
    _id: string;
    productName: string;
    images: string[];
    price: number;
    originalPrice?: number;
    condition?: string;
    seller: {
      name: string;
      rating: number;
    };
    certified?: boolean;
    returnPolicy?: string;
  };
  onRemoveItem: (id: string) => void;
  onSaveForLater: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemoveItem, onSaveForLater }) => {
  const navigate = useNavigate();

  const handleGoDetail = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <div className={cx("cart-item")}>
      <div className={cx("seller-info")}>
        <span className={cx("seller-name")}>{item.seller.name}</span>
        <span className={cx("seller-rating")}>{item.seller.rating}% positive feedback</span>
      </div>

      <div className={cx("item-content")}>
        <div className={cx("item-image")} onClick={handleGoDetail}>
          <img src={item.images[0]} alt={item.productName} />
        </div>

        <div className={cx("item-details")}>
          <h3 className={cx("item-title")} onClick={handleGoDetail}>
            {item.productName}
          </h3>
          
          {item.certified && (
            <div className={cx("certified-badge")}>Certified - Refurbished</div>
          )}
          
          {item.condition && (
            <div className={cx("item-condition")}>{item.condition}</div>
          )}

          <div className={cx("price-section")}>
            <span className={cx("current-price")}>US ${item.price.toLocaleString()}</span>
            {item.originalPrice && (
              <span className={cx("original-price")}>US ${item.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {item.returnPolicy && (
            <div className={cx("return-policy")}>{item.returnPolicy}</div>
          )}
        </div>
      </div>

      <div className={cx("item-actions")}>
        <button 
          className={cx("save-btn")} 
          onClick={() => onSaveForLater(item._id)}
        >
          Save for later
        </button>
        <button 
          className={cx("remove-btn")} 
          onClick={() => onRemoveItem(item._id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;