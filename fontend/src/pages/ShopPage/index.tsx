import React, { useState, useEffect } from 'react';

import axios from 'axios';
import ShopHeader from '../../components/Shop/ShopHeader';

interface ShopData {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  onlineTrucks?: number;
  chiefName?: string;
  followerCount?: number;
  productCount?: number;
}

const ShopPage: React.FC = () => {
  const [shopData, setShopData] = useState<ShopData>();
  const [selectedTab, setSelectedTab] = useState('products');
  const [file, setFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<'logo' | 'banner'>('logo');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch initial shop data (example)
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await axios.get(`https://localhost:7040/api/shop/${shopId}`); 
        setShopData(response.data);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };

    fetchShopData();
  }, []);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    // You can add additional logic here when tabs change
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);

    try {
      const response = await axios.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update shop data with new image URL
      setShopData(prev => ({
        ...prev,
        logoUrl: response.data.logoUrl || prev.logoUrl,
        bannerUrl: response.data.bannerUrl || prev.bannerUrl
      }));

      alert('Upload thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload thất bại!');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="shop-page">
      {/* Shop Header Component */}
      <ShopHeader 
        storeInfo={shopData}
        onTabChange={handleTabChange}
      />

      {/* Image Upload Section */}
      <div className="upload-section">
        <h3>Cập nhật ảnh cửa hàng</h3>
        <div>
          <select 
            value={imageType} 
            onChange={(e) => setImageType(e.target.value as 'logo' | 'banner')}
          >
            <option value="logo">Logo</option>
            <option value="banner">Banner</option>
          </select>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </div>
      </div>

      {/* Main Content based on selected tab */}
      <div className="shop-content">
        {selectedTab === 'products' && (
          <div>
            <h2>Danh sách sản phẩm ({shopData.productCount})</h2>
            {/* Product list would go here */}
          </div>
        )}
        
        {selectedTab === 'gallery' && (
          <div>
            <h2>Thư viện hình ảnh</h2>
            {/* Gallery would go here */}
          </div>
        )}
        
        {selectedTab === 'followers' && (
          <div>
            <h2>Người theo dõi ({shopData.followerCount})</h2>
            {/* Followers list would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;