import React, { useState } from 'react';
import './ShopHeader.scss';

interface ShopHeaderProps {
  storeInfo: {
    name: string;
    logoUrl?: string;
    bannerUrl?: string;
    onlineTrucks?: number;
    chiefName?: string;
    followerCount?: number;
    productCount?: number;
  };
  onTabChange: (tab: string) => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({
  storeInfo = {
    name: "SAMSUNG OFFICIAL STORE",
    onlineTrucks: 10,
    chiefName: "Chief",
    followerCount: 0,
    productCount: 0
  },
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('products');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <header className="samsung-header">
      {/* Banner Image from API */}
      {storeInfo.bannerUrl && (
        <div className="banner-container">
          <img src={storeInfo.bannerUrl} alt={`${storeInfo.name} banner`} />
        </div>
      )}
      
      {/* Logo and Store Name */}
      <div className="store-identity">
        {storeInfo.logoUrl && (
          <img src={storeInfo.logoUrl} alt={`${storeInfo.name} logo`} className="store-logo" />
        )}
        <h1>{storeInfo.name}</h1>
      </div>
      
      <div className="info-section">
        <div className="info-item">
          <strong>Online Status</strong>
          <ul>
            <li>Online: {storeInfo.onlineTrucks || 0} pilot trucks</li>
          </ul>
        </div>
        
        <div className="info-item">
          <strong>Store Information</strong>
          <ul>
            <li>Chief: <strong>{storeInfo.chiefName || 'Unknown'}</strong></li>
          </ul>
        </div>
      </div>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabClick('products')}
        >
          Sản phẩm {storeInfo.productCount ? `(${storeInfo.productCount})` : ''}
        </button>
        <button 
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => handleTabClick('gallery')}
        >
          Gallery
        </button>
        <button 
          className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => handleTabClick('followers')}
        >
          Người theo dõi {storeInfo.followerCount ? `(${storeInfo.followerCount})` : ''}
        </button>
      </nav>
    </header>
  );
};

export default ShopHeader;