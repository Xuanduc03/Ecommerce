import React from "react";
import { useNavigate } from "react-router-dom";
import "./CartItem.scss";
import { useDispatch } from "react-redux";
import { removeItemLocally } from "../../../redux/cartSlice";

export interface CartItemProps {
  item: {
    productId: string;
    productName: string;
    images: string[];
    price: number;
    quantity: number;
    color?: string;
    size?: string;
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
  const dispatch = useDispatch(); // ✅ Lấy dispatch thật

  const formatVND = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleGoDetail = () => {
    navigate(`/product/${item.productId}`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeItemLocally({ id: item.productId, color: item.color, size: item.size })); // ✅ Truyền đủ id + biến thể
  };

  return (
    <div className="cart-item">
      <div className="item-content">
        <div className="item-image" onClick={handleGoDetail}>
          <img src={item.images[0]} alt={item.productName} />
        </div>

        <div className="item-details">
          <h3 className="item-title" onClick={handleGoDetail}>
            {item.productName}
          </h3>

          {(item.color || item.size) && (
            <p className="variant">
              Biến thể: {item.color && <span>{item.color}</span>} {item.size && <span>- {item.size}</span>}
            </p>
          )}

          <p className="quantity">Số lượng: x{item.quantity}</p>

          <div className="price-section">
            <span className="current-price">
              {formatVND(item.price * item.quantity)}
            </span>
            {typeof item.originalPrice === "number" && (
              <span className="original-price">
                {formatVND(item.originalPrice * item.quantity)}
              </span>
            )}
          </div>

          {item.returnPolicy && <div className="return-policy">{item.returnPolicy}</div>}
        </div>
      </div>

      <div className="item-actions">
        <button className="save-btn" onClick={() => onSaveForLater(item.productId)}>
          Lưu để mua sau
        </button>
        <button className="remove-btn" onClick={handleRemove}>
          Xóa
        </button>
      </div>
    </div>
  );
};

export default CartItem;
