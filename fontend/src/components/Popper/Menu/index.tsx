import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import style from './Menu.module.scss'
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../components/Popper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Category, Subcategory } from '../../../types/category';

const cx = classNames.bind(style);

interface MenuProps {
    children: React.ReactElement;
}
export const Menu : React.FC<MenuProps> = ({ children }) => {
    const navigate = useNavigate();

    const handleCategoryClick = (category : Category) => {
        navigate(`/collection/${category._id}`, { state: { categoryName: category.name } });
    }

    const handleSubCategoryClick = (subCategory : Subcategory) => {
        navigate(`/collection/subcategories/${subCategory._id}`);
    }
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get<{ data: Category[] }>("http://localhost:8080/api/category", {
                    withCredentials: true, });
                setCategories(response.data.data);
            } catch (error) {
                console.error("Lấy danh mục ko thành công", error);
            }
        };

        fetchCategories();
    }, [])
    const renderItems = () => {
        return (
            <div className={cx('category-menu')}>
                {/* Categories */}
                <div className={cx('categories')}>
                    {categories.map((category) => (
                        <div key={category._id} className={cx('category')}>
                            <h3 key={category._id} onClick={() => handleCategoryClick(category)} className={cx('category-title')}>
                                {category.name}
                            </h3>
                            <ul className={cx('category-list')}>
                                {category.children.map((subCategory) => (
                                    <li key={subCategory._id} onClick={() => handleSubCategoryClick(subCategory)} className={cx('category-item')}>
                                        <img src={subCategory.image} alt={subCategory.name} className={cx('subcategory-image')} />
                                        <p className={cx("subcategory-title")}>{subCategory.name}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <Tippy
            interactive
            placement="bottom-start"
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
    )
}
