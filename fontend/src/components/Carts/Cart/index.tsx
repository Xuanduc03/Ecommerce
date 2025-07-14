// Cart.tsx
import React from "react";
import classNames from "classnames/bind";
import styles from "./Cart.module.scss";
import CartItem from "../CartItem";
import { type CartItemProps } from "../CartItem";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart } from "../../../redux/cartSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const isAuthenticated = false; // Thay bằng logic xác thực thực tế

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    toast.info("Item removed from cart");
  };

  const handleSaveForLater = (id: string) => {
    toast.info("Item saved for later");
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared");
  };

  const totalPrice = cartItems.reduce(
    (sum: number, item: CartItemProps["item"]) => sum + item.price,
    0
  );

  return (
    <div className={cx("cart-container")}>
      <h1 className={cx("cart-title")}>Shopping cart</h1>

      {!isAuthenticated && (
        <div className={cx("auth-notice")}>
          You're signed out right now. To save these items or see your previously saved items, sign in.
        </div>
      )}

      <div className={cx("cart-content")}>
        {/* Danh sách sản phẩm */}
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
                <span>Item ({cartItems.length})</span>
                <span>{totalPrice.toLocaleString()} VND</span>
              </div>
            </>
          ) : (
            <div className={cx("empty-cart")}>Your cart is empty</div>
          )}
        </div>

        {/* Tổng kết đơn hàng */}
        <div className={cx("cart-summary")}>
          <div className={cx("summary-content")}>
            <h3>Subtotal</h3>
            <div className={cx("total-price")}>{totalPrice.toLocaleString()} VND</div>

            <button className={cx("checkout-btn")}>
              Go to checkout
            </button>

            <div className={cx("payment-info")}>
              <p>Purchase protected by eBay Money Back Guarantee</p>
              <p>Earn up to 5X points with your eBay Mastercard®</p>
              <Link to="/">See details</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("related-items")}>
        <h3>Explore related items</h3>
        <p>Sponsored</p>
        {/* Thêm danh sách sản phẩm liên quan ở đây */}
      </div>
    </div>
  );
};

export default Cart;