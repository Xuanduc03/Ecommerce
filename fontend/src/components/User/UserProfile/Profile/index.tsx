import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Camera } from 'lucide-react';
import './Profile.scss';
import axios from 'axios';
import { toast } from 'react-toastify';

interface UserProfile {
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dateOfBirth?: {
    day: string;
    month: string;
    year: string;
  } | null;
  avatar: string;
}


const genderOptions = [
  { label: 'Nam', value: true },
  { label: 'Nữ', value: false },
  { label: 'Khác', value: null }
] as const;

interface UserProfileProps {
  user: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

const defaultDateOfBirth = { day: '', month: '', year: '' };
type DateOfBirthField = 'day' | 'month' | 'year';
const API_URL = 'https://localhost:7040/api';

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdateProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    ...user,
    dateOfBirth: user.dateOfBirth || defaultDateOfBirth,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    
    setProfile({
      ...user,
       ...parseFullName(user.fullName),
  dateOfBirth: parseDateOfBirth(user.dateOfBirth),
    });
    setIsEditing(false);
  }, [user]);


  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsEditing(true);
  };

  const handleDateChange = (field: DateOfBirthField, value: string) => {
    setProfile((prev) => ({
      ...prev,
      dateOfBirth: {
        ...(prev.dateOfBirth || defaultDateOfBirth),
        [field]: value,
      },
    }));
    setIsEditing(true);
  };

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB
      toast.error('Kích thước file không được vượt quá 1MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPEG, PNG)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const res = await axios.post(`${API_URL}/user/upload-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const newAvatarUrl = res.data.avatarUrl || res.data.url;

      const updatedProfile = {
        ...profile,
        avatar: newAvatarUrl,
      };

      setProfile(updatedProfile);
      onUpdateProfile({ avatar: newAvatarUrl });
      setIsEditing(true);

      toast.success('Tải ảnh thành công!');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      const errorMessage = error.response?.data?.message || 'Tải ảnh thất bại!';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // ✅ Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isEditing) return;

    // ✅ Validate required fields
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ và tên');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }
      const getFormattedDate = (dob: UserProfile['dateOfBirth']) => {
        if (!dob?.day || !dob.month || !dob.year) return null;
        return `${dob.year}-${dob.month.padStart(2, '0')}-${dob.day.padStart(2, '0')}`;
      };

      const updateData = {
        fullName: `${profile.lastName.trim()} ${profile.firstName.trim()}`.trim(),
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        gender: profile.gender,
        dateOfBirth: getFormattedDate(profile.dateOfBirth),
        avatar: profile.avatar

      };

      const response = await axios.put(
        `${API_URL}/user/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');

      if (response.data && response.data.user) {
        setProfile(prev => ({
          ...prev,
          ...response.data.user
        }));
      }

    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại!';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProfile({
      ...user,
      dateOfBirth: user.dateOfBirth || defaultDateOfBirth,
    });
    setIsEditing(false);
  };

  const parseDateOfBirth = (dobStr: string | undefined): UserProfile['dateOfBirth'] => {
    if (!dobStr) return { day: '', month: '', year: '' };
    const [year, month, day] = dobStr.split('T')[0].split('-');
    return { day, month, year };
  };


  const parseFullName = (fullName: string | undefined) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    return {
      firstName: parts.pop() || '',
      lastName: parts.join(' '),
    };
  };

  if (!profile) return <div className="loading">Đang tải hồ sơ...</div>;
  return (
    <div className="user-profile-page">
      <div className="main-content">
        <div className="profile-header">
          <h1>Hồ Sơ Của Tôi</h1>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <span className="readonly-field">{profile.username}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Họ</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="form-input"
                  placeholder="Nhập họ"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="form-input"
                  placeholder="Nhập tên"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="form-input"
                placeholder="Nhập số điện thoại"
                required
              />
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
                      onChange={(e) => handleInputChange('gender', e.target.value as typeof gender)}
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
                  value={profile.dateOfBirth?.day || ''}
                  onChange={(e) => handleDateChange('day', e.target.value)}
                  className="select-input"
                >
                  <option value="">Ngày</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />

                <select
                  value={profile.dateOfBirth?.month || ''}
                  onChange={(e) => handleDateChange('month', e.target.value)}
                  className="select-input"
                >
                  <option value="">Tháng</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />

                <select
                  value={profile.dateOfBirth?.year || ''}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                  className="select-input"
                >
                  <option value="">Năm</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-icon" size={16} />
              </div>
            </div>

            <div className="form-actions">
              {/* ✅ Thêm nút Cancel */}
              {isEditing && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Hủy
                </button>
              )}
              <button
                className={`save-btn ${!isEditing ? 'disabled' : ''}`}
                type="submit"
                disabled={!isEditing || submitting}
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>

          <div className="avatar-section">
            <div className="avatar-upload">
              <img
                src={profile.avatar}
                alt="Profile avatar"
                onError={(e) => {
                  // ✅ Fallback avatar nếu ảnh lỗi
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <button
                className={`upload-btn ${uploading ? 'uploading' : ''}`}
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
              >
                <Camera size={16} />
                {uploading && <div className="spinner"></div>}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            <div className="avatar-info">
              <p>Chọn Ảnh</p>
              <small>Dung lượng file tối đa 1 MB</small>
              <small>Định dạng: JPEG, PNG</small>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;