import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import style from './UserOption.module.scss';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '../../../components/Popper';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Define interface for User
interface User {
  fullname: string;
  email: string;
  role: string;
}

// Define props interface
interface UserOptionProps {
  children: React.ReactElement;
}

const cx = classNames.bind(style);

export const UserOption: React.FC<UserOptionProps> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get<User>('http://localhost:8080/api/user/me', {
                    withCredentials: true, 
                });
                setUser(response.data);
            } catch (error) {
               console.log("Lỗi khi lấy thông tin ", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            // Note: You need to import or define the logout function
            await axios.post('http://localhost:8080/api/user/logout', {}, {
                withCredentials: true, 
            });
            toast.success("Đã đăng xuất");
            setUser(null);
            navigate("/");
            setTimeout(() => window.location.reload(), 100);
        } catch (error) {
            toast.error("cannot logout");
            console.log(error);
        }
    }

    const renderItems = () => {
        return (
            <div className={cx("user-dropdown")}>
                <div className={cx("dropdown-menu")}>
                    {user ? (
                        <>
                            <div className={cx("user-info")}>
                                <p className={cx("username")}>Xin chào {user.fullname}</p>
                                <p className={cx("email")}>{user.email}</p>
                                {user.role === "admin" &&
                                    <Link to={'/admin/dashboard'}>Trang chủ admin</Link>
                                }
                            </div>
                            <button className={cx("logout")} onClick={handleLogout}>
                                <i className="fa-solid fa-right-from-bracket"></i>Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to={'/login'} className={cx("login")}>
                                Đăng nhập
                            </Link>
                            <Link to={'/signup'} className={cx("register")}>
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Tippy
            interactive
            placement="bottom-end"
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