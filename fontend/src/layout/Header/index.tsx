import React, { useState } from 'react';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaBell, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../redux/store'; // hoặc đường dẫn chính xác tới store.ts
import { logout } from '../../redux/authSlice';
import { CountCart } from '../../components/Popper/CountCart';
import {type UseSelector } from 'react-redux';


const categories = [
    "Tất cả danh mục", "Điện tử", "Xe cộ", "Thời trang", "Sưu tầm & Nghệ thuật", "Thể thao", "Sức khỏe & Làm đẹp", "Thiết bị công nghiệp", "Nhà & Vườn", "Ưu đãi", "Bán hàng"
];

const navLinks = [
    { label: "Ưu đãi hàng ngày", to: "#" },
    { label: "Thương hiệu nổi bật", to: "#" },
    { label: "Thẻ quà tặng", to: "#" },
    { label: "Trợ giúp & Liên hệ", to: "#" },
];

const menuLinks = [
    "eBay Live", "Đã lưu", "Điện tử", "Xe cộ", "Thời trang", "Sưu tầm & Nghệ thuật", "Thể thao", "Sức khỏe & Làm đẹp", "Thiết bị công nghiệp", "Nhà & Vườn", "Ưu đãi", "Bán hàng"
];

const Header: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(categories[0]);

    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý tìm kiếm
    };

    const handleLogout = () => {
        dispatch(logout());
        // Optional: redirect hoặc reload trang
        window.location.href = '/login';
    };

    return (
        <header className={styles.header}>
            {/* Thanh trên cùng */}
            <div className={styles['header-top']}>
                <div className={`${styles.container} ${styles['header-top-row']}`}>
                    <div>
                        {user ? (
                            <>
                                <span>Xin chào, <strong>{user.name}</strong>!</span>
                                <span
                                    onClick={handleLogout}
                                    className={styles['top-link']}
                                    style={{ cursor: 'pointer', marginLeft: 10 }}
                                >
                                    Đăng xuất
                                </span>
                            </>
                        ) : (
                            <>
                                <span>Xin chào! </span>
                                <Link to="/login" className={styles['top-link']}>Đăng nhập</Link>
                                <span> hoặc </span>
                                <Link to="/signup" className={styles['top-link']}>Đăng ký</Link>
                            </>
                        )}
                    </div>
                    <nav className={styles['top-nav']}>
                        {navLinks.map(link => (
                            <Link key={link.label} to={link.to} className={styles['top-link']}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className={styles['top-right']}>
                        <span>Giao hàng đến</span>
                        <span>Bán hàng</span>
                        <span>Danh sách theo dõi <FaChevronDown /></span>
                        <span>eBay của tôi <FaChevronDown /></span>
                        <FaBell className={styles.icon} />
                        <CountCart>
                            <div className={styles['cart-wrapper']}>
                                <FaShoppingCart className={styles.icon} />
                                {/* Hiển thị số lượng nếu có */}
                                {cartItems.length > 0 && (
                                    <span className={styles['cart-badge']}>{cartItems.length}</span>
                                )}
                            </div>
                        </CountCart>
                    </div>
                </div>
            </div>

            {/* Thanh tìm kiếm chính */}
            <div className={styles['header-main']}>
                <div className={`${styles.container} ${styles['header-main-row']}`}>
                    <Link to="/" className={styles.logo}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="117" height="48" viewBox="0 0 122 48.592" id="gh-logo" aria-labelledby="ebayLogoTitle"><title id="ebayLogoTitle">eBay Home</title><g><path fill="#F02D2D" d="M24.355 22.759c-.269-5.738-4.412-7.838-8.826-7.813-4.756.026-8.544 2.459-9.183 7.915zM6.234 26.93c.364 5.553 4.208 8.814 9.476 8.785 3.648-.021 6.885-1.524 7.952-4.763l6.306-.035c-1.187 6.568-8.151 8.834-14.145 8.866C4.911 39.844.043 33.865-.002 25.759c-.05-8.927 4.917-14.822 15.765-14.884 8.628-.048 14.978 4.433 15.033 14.291l.01 1.625z"></path><path fill="#0968F6" d="M46.544 35.429c5.688-.032 9.543-4.148 9.508-10.32s-3.947-10.246-9.622-10.214-9.543 4.148-9.509 10.32 3.974 10.245 9.623 10.214zM30.652.029l6.116-.034.085 15.369c2.978-3.588 7.1-4.65 11.167-4.674 6.817-.037 14.412 4.518 14.468 14.454.045 8.29-5.941 14.407-14.422 14.454-4.463.026-8.624-1.545-11.218-4.681a33.237 33.237 0 01-.19 3.731l-5.994.034c.09-1.915.185-4.364.174-6.322z"></path><path fill="#FFBD14" d="M77.282 25.724c-5.548.216-8.985 1.229-8.965 4.883.013 2.365 1.94 4.919 6.7 4.891 6.415-.035 9.826-3.556 9.794-9.289v-.637c-2.252.02-5.039.054-7.529.152zm13.683 7.506c.01 1.778.071 3.538.232 5.1l-5.688.032a33.381 33.381 0 01-.225-3.825c-3.052 3.8-6.708 4.909-11.783 4.938-7.532.042-11.585-3.915-11.611-8.518-.037-6.665 5.434-9.049 14.954-9.318 2.6-.072 5.529-.1 7.945-.116v-.637c-.026-4.463-2.9-6.285-7.854-6.257-3.68.021-6.368 1.561-6.653 4.2l-6.434.035c.645-6.566 7.53-8.269 13.595-8.3 7.263-.04 13.406 2.508 13.448 10.192z"></path><path fill="#92C821" d="M91.939 19.852l-4.5-8.362 7.154-.04 10.589 20.922 10.328-21.02 6.486-.048-18.707 37.251-6.85.039 5.382-10.348-9.887-18.393"></path></g></svg>
                    </Link>
                    <form className={styles['search-form-ebay']} onSubmit={handleSearch}>
                        <input
                            type="text"
                            className={styles['search-input-ebay']}
                            placeholder="Tìm kiếm sản phẩm bất kỳ"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className={styles['search-category']}>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={styles['category-select']}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <FaChevronDown className={styles['dropdown-icon']} />
                        </div>
                        <button type="submit" className={styles['search-btn-ebay']}>Tìm kiếm</button>
                        <span className={styles['search-advanced']}>Nâng cao</span>
                    </form>
                </div>
            </div>

            {/* Menu liên kết */}
            <div className={styles['header-menu']}>
                <div className={`${styles.container} ${styles['header-menu-row']}`}>
                    {menuLinks.map(link => (
                        <Link key={link} to="#" className={styles['menu-link']}>
                            {link}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
