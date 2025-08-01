import React from 'react';
import './UserSidebar.scss';
import { User } from 'lucide-react';

interface UserProfile {
  avatar: string;
  username: string;
}

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  profile: UserProfile;
}

const sidebarItems = [
  { label: "Hồ Sơ", key: "profile" },
  { label: "Địa Chỉ", key: "address" },
  { label: "Đổi Mật Khẩu", key: "password" },
  { label: "Cài Đặt Thông Báo", key: "notifications" },
  { label: "Thông Tin Cá Nhân", key: "info" },
];

const UserSidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab, profile }) => {
  return (
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
        {sidebarItems.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => onChangeTab(item.key)}
          >
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default UserSidebar;