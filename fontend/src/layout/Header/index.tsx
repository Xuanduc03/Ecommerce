import React, { useEffect, useState } from 'react';
import styles from './Header.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaBell, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../redux/store';
import { logout } from '../../redux/authSlice';
import { CountCart } from '../../components/Popper/CountCart';
import axios from 'axios';

const API_URL = 'https://localhost:7040/api';


interface Product {
    productId: string;
    productName: string;
    originalPrice: number;
    imageUrls: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    parentCategoryId?: string | null;
    children?: Category[];
}

const navLinks = [
    { label: "Ưu đãi hàng ngày", to: "#" },
    { label: "Thương hiệu nổi bật", to: "#" },
    { label: "Thẻ quà tặng", to: "#" },
    { label: "Trợ giúp & Liên hệ", to: "#" },
];

const Header: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const token = localStorage.getItem('authToken');

    const user = useSelector((state: RootState) => state.auth?.user);
    const cartItems = useSelector((state: RootState) => state.cart?.items || []);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/categories`, {
                    headers: { Authorization: `Bearer ${token || ''}` }
                });
                const data = Array.isArray(response.data) ? response.data : response.data.data || [];

                // Build category tree (cha -> con)
                const categoriesMap: Record<string, Category> = {};
                data.forEach((cat: any) => {
                    categoriesMap[cat.categoryId] = {
                        id: cat.categoryId,
                        name: cat.name,
                        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                        parentCategoryId: cat.parentCategoryId,
                        children: []
                    };
                });

                const tree: Category[] = [];
                Object.values(categoriesMap).forEach(cat => {
                    if (cat.parentCategoryId && categoriesMap[cat.parentCategoryId]) {
                        categoriesMap[cat.parentCategoryId].children!.push(cat);
                    } else {
                        tree.push(cat);
                    }
                });

                setCategories(tree);
            } catch (err) {
                console.error('Error fetching categories', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setSearching(true);
            const res = await axios.get(`${API_URL}/product/search`, {
                params: { keyword: searchTerm }
            });
            setProducts(res.data || []);
            setShowResults(true);

        } catch (err) {
            console.error('Lỗi khi tìm kiếm:', err);
        } finally {
            setSearching(false);
        }
    };


    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            {/* Top bar */}
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
                        <Link to={'/order'}>Đơn hàng của tôi</Link>
                        <span>Danh sách theo dõi</span>
                        <Link to={'/me'}>Hồ sơ</Link>
                        <FaBell className={styles.icon} />
                        <CountCart>
                            <div className={styles['cart-wrapper']}>
                                <FaShoppingCart className={styles.icon} />
                                {cartItems.length > 0 && (
                                    <span className={styles['cart-badge']}>{cartItems.length}</span>
                                )}
                            </div>
                        </CountCart>
                    </div>
                </div>
            </div>

            {/* Search bar */}
            <div className={styles['header-main']}>
                <div className={`${styles.container} ${styles['header-main-row']}`}>
                    <Link to="/" className={styles.logo}>
                        {/* Logo giữ nguyên */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="117" height="48" viewBox="0 0 122 48.592">
                        </svg>
                    </Link>
                    <form className={styles['search-form-ebay']} onSubmit={handleSearch}>
                        <input
                            type="text"
                            className={styles['search-input-ebay']}
                            placeholder="Tìm kiếm sản phẩm bất kỳ"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className={styles['search-btn-ebay']}>Tìm kiếm</button>
                    </form>

                    {showResults && products.length > 0 && (
                        <div className={styles['search-results']}>
                            <button
                                className={styles['close-button']}
                                onClick={() => setShowResults(false)}
                            >
                                ×
                            </button>
                            {products.map(product => (
                                <Link
                                    key={product.productId}
                                    to={`/product/${product.productId}`}
                                    className={styles['search-result-item']}
                                >
                                    <img
                                        src={product.imageUrls?.[0] || '/no-img.jpg'}
                                        alt={product.productName}
                                        className={styles['search-result-image']}
                                    />
                                    <div className={styles['search-result-info']}>
                                        <h4>{product.productName}</h4>
                                        <p>{product.originalPrice.toLocaleString()} đ</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>




            {/* Menu hiển thị danh mục con */}
            <div className={styles['header-menu']}>
                <div className={`${styles.container} ${styles['header-menu-row']}`}>
                    {categories.flatMap(parent =>
                        parent.children?.map(child => (
                            <Link key={child.id} to={`/category/${child.slug}`} className={styles['menu-link']}>
                                {child.name}
                            </Link>
                        )) || []
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
