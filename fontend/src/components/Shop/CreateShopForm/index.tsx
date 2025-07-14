import { useState } from 'react';
import './CreateShopForm.scss';

interface ShopFormData {
  name: string;
  description: string;
  phone: string;
  logo?: File | null;
}

export default function CreateShopForm() {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    phone: '',
    logo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Gọi API tạo shop ở đây
    console.log('Shop data:', formData);
    // Sau khi xử lý xong:
    // setIsSubmitting(false);
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
          <label htmlFor="phone">Số điện thoại *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
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
              onChange={handleFileChange}
            />
            <label htmlFor="logo" className="upload-btn">
              {formData.logo ? formData.logo.name : 'Chọn ảnh'}
            </label>
            {formData.logo && (
              <span className="file-name">{formData.logo.name}</span>
            )}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Đang tạo...' : 'Tạo shop ngay'}
        </button>
      </form>
    </div>
  );
}