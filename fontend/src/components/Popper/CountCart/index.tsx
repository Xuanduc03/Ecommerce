import React from 'react';
import Tippy from '@tippyjs/react/headless';
import style from './CountCart.module.scss';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../components/Popper';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { Product } from '../../../types/product';
import { removeItemLocally } from '../../../redux/cartSlice';

// Define interfaces
interface CartItem {
    productId: string;
    productName: string;
    images: string[];
    color: string;
    size: string;
    price: {
        current: number;
        original?: number;
    };
    quantity: number;
    product: Product;
}

interface RootState {
    cart: {
        items: CartItem[];
    };
}

interface CountCartProps {
    children: React.ReactElement;
}

const cx = classNames.bind(style);

export const CountCart: React.FC<CountCartProps> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);

    const handleDetailProduct = (item: CartItem) => {
        const productId = item.product?._id || item.productId; // Use product._id if available, otherwise use item._id
        navigate(`/product/${productId}`);
    }

    const formatVND = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const renderItems = () => {
        return (
            <div className={cx('list-cart')}>
                {/* title and count cart */}
                <div className={cx("list-count")}>
                    <p><strong>{cartItems.length}</strong> sản phẩm</p>
                    <Link to="/cart" className={cx("count-all")}>Xem tất cả</Link>
                </div>
                {cartItems.map((item) => (
                    <div
                        key={item.productId}
                        onClick={() => handleDetailProduct(item)}
                        className={cx("list-product")}
                    >
                        <img
                            src={Array.isArray(item.images) ? item.images[0] : item.images}
                            alt={item.productName}
                        />
                        <div className={cx("detail")}>
                            <p className={cx("name-product")}>{item.productName}</p>
                            <p className={cx("type-product")}>{item.color}</p>
                            <div className={cx("price-list")}>
                                <h4 className={cx('price')}>
                                    <strong>{formatVND(item.price * item.quantity)}</strong>
                                </h4>
                                {item.price?.original != null && (
                                    <p className={cx('old-price')}>
                                        {item.price.original.toLocaleString()} đ
                                    </p>
                                )}
                            </div>
                            <p className={cx("quantity")}>x{item.quantity}</p>
                        </div>
                        <div className={cx("delete")}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(removeItemLocally({ id: item.productId, color: item.color, size: item.size })); 
                                }}
                            >x</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Tippy
            interactive
            placement="bottom-end"
            delay={[0, 200]}
            render={(attrs) => (
                <div className={cx('content')} {...attrs}>
                    <PopperWrapper>
                        {renderItems()}
                    </PopperWrapper>
                </div>
            )}
        >
            {children}
        </Tippy>
    );
}