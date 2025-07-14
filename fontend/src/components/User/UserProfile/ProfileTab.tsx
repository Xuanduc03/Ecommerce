import React from 'react';
import { Camera } from 'lucide-react';

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  avatar: string;
}

interface ProfileTabProps {
  profile: UserProfile;
  onProfileChange: (field: keyof UserProfile, value: any) => void;
  onDateChange: (field: keyof UserProfile['dateOfBirth'], value: string) => void;
  onSave: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  onProfileChange,
  onDateChange,
  onSave
}) => {
  return (
    <div className="profile-form">
      <div className="form-section">
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <span className="readonly-field">{profile.username}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tên</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => onProfileChange('lastName', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => onProfileChange('firstName', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="input-with-action">
            <span className="masked-value">{profile.email}</span>
            <button className="change-btn">Thay Đổi</button>
          </div>
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <div className="input-with-action">
            <span className="masked-value">{profile.phone}</span>
            <button className="change-btn">Thay Đổi</button>
          </div>
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <div className="radio-group">
            {(['Nam', 'Nữ', 'Khác'] as const).map((gender) => (
              <label key={gender} className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={profile.gender === gender}
                  onChange={(e) => onProfileChange('gender', e.target.value)}
                />
                <span>{gender}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Ngày sinh</label>
          <div className="date-select">
            <select
              value={profile.dateOfBirth.day}
              onChange={(e) => onDateChange('day', e.target.value)}
              className="select-input"
            >
              <option value="">Ngày</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <select
              value={profile.dateOfBirth.month}
              onChange={(e) => onDateChange('month', e.target.value)}
              className="select-input"
            >
              <option value="">Tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <select
              value={profile.dateOfBirth.year}
              onChange={(e) => onDateChange('year', e.target.value)}
              className="select-input"
            >
              <option value="">Năm</option>
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="save-btn" onClick={onSave}>
            Lưu
          </button>
        </div>
      </div>

      <div className="avatar-section">
        <div className="avatar-upload">
          <img src={profile.avatar} alt="Profile avatar" />
          <button className="upload-btn">
            <Camera size={16} />
          </button>
        </div>
        <div className="avatar-info">
          <p>Chọn Ảnh</p>
          <small>Dung lượng file tối đa 1 MB</small>
          <small>Định dạng: JPEG, PNG</small>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;