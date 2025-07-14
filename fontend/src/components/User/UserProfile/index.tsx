import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  CreditCard, 
  MapPin, 
  Key, 
  Settings, 
  ShoppingBag, 
  Gift,
  Star,
  Calendar,
  ChevronDown,
  Camera
} from 'lucide-react';
import './UserProfile.scss';

// Types
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

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: string;
  children?: SidebarItem[];
}

interface UserProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

// Mock data
const mockUser: UserProfile = {
  username: 'mxduc37777',
  firstName: 'Mmm',
  lastName: 'Tên',
  email: 'ma*******@gmail.com',
  phone: '*******95',
  gender: 'Nam',
  dateOfBirth: {
    day: '15',
    month: '6',
    year: '1995'
  },
  avatar: 'https://via.placeholder.com/100x100'
};

const sidebarItems: SidebarItem[] = [
  {
    icon: <Bell size={16} />,
    label: 'Thông Báo',
    isActive: false
  },
  {
    icon: <User size={16} />,
    label: 'Tài Khoản Của Tôi',
    isActive: true,
    children: [
      { icon: null, label: 'Hồ Sơ', isActive: true },
      { icon: null, label: 'Ngân Hàng', isActive: false },
      { icon: null, label: 'Địa Chỉ', isActive: false },
      { icon: null, label: 'Đổi Mật Khẩu', isActive: false },
    ]
  },
  {
    icon: <ShoppingBag size={16} />,
    label: 'Đơn Mua',
    isActive: false
  },
  {
    icon: <Gift size={16} />,
    label: 'Kho Voucher',
    isActive: false
  },
];

const UserProfilePage: React.FC<UserProfilePageProps> = ({ 
  user = mockUser, 
  onUpdateProfile 
}) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: keyof UserProfile['dateOfBirth'], value: string) => {
    setProfile(prev => ({
      ...prev,
      dateOfBirth: {
        ...prev.dateOfBirth,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdateProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="user-profile-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-info">
          <div className="avatar">
            <img src={profile.avatar} alt="User avatar" />
            <span className="username">{profile.username}</span>
          </div>
          <div className="edit-profile">
            <User size={12} />
            <span>Sửa Hồ Sơ</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <div key={index} className="nav-item">
              <div className={`nav-link ${item.isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </div>
              {item.children && (
                <div className="nav-children">
                  {item.children.map((child, childIndex) => (
                    <div 
                      key={childIndex} 
                      className={`nav-child ${child.isActive ? 'active' : ''}`}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="profile-header">
          <h1>Hồ Sơ Của Tôi</h1>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>

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
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                      onChange={(e) => handleInputChange('gender', e.target.value)}
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
                  onChange={(e) => handleDateChange('day', e.target.value)}
                  className="select-input"
                >
                  <option value="">Ngày</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />

                <select
                  value={profile.dateOfBirth.month}
                  onChange={(e) => handleDateChange('month', e.target.value)}
                  className="select-input"
                >
                  <option value="">Tháng</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />

                <select
                  value={profile.dateOfBirth.year}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                  className="select-input"
                >
                  <option value="">Năm</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={handleSave}>
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
      </div>

    </div>
  );
};

export default UserProfilePage;