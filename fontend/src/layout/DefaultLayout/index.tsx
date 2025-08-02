import React from 'react'
import Header from '../Header';
import style from "./DefaultLayout.module.scss";
import classNames from 'classnames/bind';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(style);

interface DefaultLayoutProps {
  children: React.ReactNode;
}
const DefaultLayout : React.FC<DefaultLayoutProps> = ({ children }) => {
  const location = useLocation();
  const noLayoutPaths = ['/login', '/signup', '/forgot-password', '/create-shop', '/checkout', '/reset-password'];

  const isNoLayout = noLayoutPaths.includes(location.pathname);

  if (isNoLayout) {
    return <>{children}</>; // Không render Header hay container gì cả
  }
  return (
    <div className={cx('wrapper')}>
        <Header />
        <div className={cx('container')}>
            {children}
        </div>
    </div>
  )
}

export default DefaultLayout