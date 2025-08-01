import React from "react";
import classNames from "classnames/bind";
import styles from "./Cart.module.scss";
import CartItem from "../CartItem";
import { type CartItemProps } from "../CartItem";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleSaveForLater = (id: string) => {
    toast.info("Đã lưu sản phẩm để mua sau");
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Đã xóa toàn bộ giỏ hàng");
  };

  const totalPrice = cartItems.reduce(
    (sum: number, item: CartItemProps["item"]) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống, không thể thanh toán!");
      return;
    }
    navigate("/checkout", { state: { cartItems, totalPrice } });
  };

  return (
    <div className={cx("cart-container")}>
      <h1 className={cx("cart-title")}>Giỏ hàng</h1>

      {!token && (
        <div className={cx("auth-notice")}>
          Bạn chưa đăng nhập. Đăng nhập để lưu lại các sản phẩm hoặc xem các sản phẩm đã lưu trước đó.
        </div>
      )}

      <div className={cx("cart-content")}>
        <div className={cx("cart-items")}>
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item: CartItemProps["item"]) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onRemoveItem={handleRemoveItem}
                  onSaveForLater={handleSaveForLater}
                />
              ))}

              <div className={cx("cart-subtotal")}>
                <span>Số lượng ({cartItems.length})</span>
                <span>{totalPrice.toLocaleString()} VND</span>
              </div>
              <button className={cx("clear-cart-btn")} onClick={handleClearCart}>
                Xóa toàn bộ giỏ hàng
              </button>
            </>
          ) : (
            <div className={cx("empty-cart")}>Giỏ hàng của bạn đang trống</div>
          )}
        </div>

        <div className={cx("cart-summary")}>
          <div className={cx("summary-content")}>
            <h3>Tạm tính</h3>
            <div className={cx("total-price")}>{totalPrice.toLocaleString()} VND</div>

            <button className={cx("checkout-btn")} onClick={handleCheckout}>
              Thanh toán
            </button>

            <div className={cx("payment-info")}>
              <p>Mua hàng được bảo vệ bởi Chính sách hoàn tiền</p>
              <p>Nhận điểm thưởng khi thanh toán qua thẻ tín dụng</p>
              <Link to="/">Xem chi tiết</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("related-items")}>
        <h3>Khám phá sản phẩm liên quan</h3>
        <p>Tài trợ</p>
      </div>
    </div>
  );
};

export default Cart;