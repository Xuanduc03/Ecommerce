import React, { useState } from 'react';
import axios from 'axios';
import './CreateShopForm.scss';
import { toast } from 'react-toastify';

interface ShopFormData {
  name: string;
  description: string;
  contactPhone: string;
  logo?: File | null;
  banner?: File | null;
}

const CreateShopForm: React.FC = () => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    contactPhone: '',
    logo: null,
    banner: null
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Upload ảnh riêng trước, trả về URL
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const res = await axios.post('https://localhost:7040/api/shop/upload-image', formData, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data?.logoUrl; // BE trả về URL ảnh
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, banner: e.target.files![0] }));
    }
  };

  const sellerId = localStorage.getItem('sellerId');
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoUrl = '';
      let bannerUrl = '';

      if (formData.logo) {
        logoUrl = await uploadImage(formData.logo); // nhận logoUrl từ BE
      }
      if (formData.banner) {
        bannerUrl = await uploadImage(formData.banner);
      }

      const token = localStorage.getItem('token');
      await axios.post(
        'https://localhost:7040/api/shop',
        {
          name: formData.name,
          description: formData.description,
          contactPhone: formData.contactPhone,
          sellerId: sellerId,
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null
        },
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast('Tạo shop thành công!');
      window.location.href = '/seller';
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi tạo shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-shop-container">
      <h1>Tạo shop của bạn</h1>
      <p className="subtitle">Bắt đầu bán hàng chỉ với vài bước đơn giản</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Tên shop *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Thời trang ABC"
            required
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả ngắn</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Giới thiệu về shop của bạn..."
            rows={3}
            maxLength={200}
          />
          <span className="char-counter">{formData.description.length}/200</span>
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">Số điện thoại *</label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="0987 654 321"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo">Logo shop (tuỳ chọn)</label>
          <div className="file-upload">
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
            />
            <label htmlFor="logo" className="upload-btn">
              {formData.logo ? formData.logo.name : 'Chọn ảnh'}
            </label>
            {formData.logo && <span className="file-name">{formData.logo.name}</span>}
          </div>
        </div>


        <div className="form-group">
          <label htmlFor="banner">Banner shop (tuỳ chọn)</label>
          <div className="file-upload">
            <input
              type="file"
              id="banner"
              accept="image/*"
              onChange={handleBannerChange}
            />
            <label htmlFor="banner" className="upload-btn">
              {formData.banner ? formData.banner.name : 'Chọn ảnh'}
            </label>
            {formData.banner && <span className="file-name">{formData.banner.name}</span>}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Đang tạo...' : 'Tạo shop ngay'}
        </button>
      </form>
    </div>
  );
};

export default CreateShopForm;
