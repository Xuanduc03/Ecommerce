// src/pages/User/ProfilePage.tsx
import React from "react";
import axios from "axios";
import './ProfilePage.scss';
import UserSidebar from "../../components/User/UserProfile/UserSidebar";
import UserProfile from "../../components/User/UserProfile/Profile";
import AddressesTab from "../../components/User/UserProfile/UserAddress/AddressTab";
import ChangePasswordForm from "../../components/User/UserProfile/ChangePassword/ChangePassword";

const API_URL = "https://localhost:7040/api";

export const ProfilePage: React.FC = () => {
    const [user, setUser] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<string>("profile");
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const token = localStorage.getItem('authToken');

    React.useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response || response.status !== 200) {
                    throw new Error('Không lấy được hồ sơ người dùng');
                }
                setUser(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [token]);

    
    const handleUpdateProfile = async (updatedProfile: any) => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${API_URL}/user/profile`,
                updatedProfile,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUser(response.data); 
            setError(null);
            alert("Cập nhật hồ sơ thành công!");
        } catch (err: any) {
            setError("Cập nhật hồ sơ thất bại!");
        } finally {
            setLoading(false);
        }
    };
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Không có dữ liệu</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <UserProfile
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                />;
            case "address":
                return <AddressesTab />;
            case "password":
                return <ChangePasswordForm />;
            case "notifications":
                return <div>Tab thông báo</div>;
            case "info":
                return <div>Thông tin cá nhân</div>;
            default:
                return null;
        }
    };

    return (
        <div className="profile-page">
            <UserSidebar
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                profile={{ avatar: user.avatarUrl, username: user.username }}
            />
            <div className="profile-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ProfilePage;
