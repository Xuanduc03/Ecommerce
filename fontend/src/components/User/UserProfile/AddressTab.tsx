import React from 'react';
import { Plus } from 'lucide-react';
import './UserProfile.scss'

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  tags: string[];
}

interface AddressesTabProps {
  addresses: Address[];
  onAddAddress: () => void;
  onUpdateAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault
}) => {
  return (
    <div className="addresses-section">
      <div className="addresses-header">
        <h2>Địa chỉ của tôi</h2>
        <button className="add-address-btn" onClick={onAddAddress}>
          <Plus size={16} />
          Thêm địa chỉ mới
        </button>
      </div>

      <div className="addresses-list">
        <h3>Địa chỉ</h3>
        {addresses.map((address) => (
          <div key={address.id} className="address-item">
            <div className="address-info">
              <div className="address-header">
                <span className="address-name">{address.name}</span>
                <span className="address-phone">{address.phone}</span>
                <div className="address-actions">
                  <button 
                    className="action-btn"
                    onClick={() => onUpdateAddress(address)}
                  >
                    Cập nhật
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => onDeleteAddress(address.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="address-details">
                <p>{address.address}</p>
                <div className="address-tags">
                  {address.tags.map((tag, index) => (
                    <span key={index} className={`tag ${tag === 'Mặc định' ? 'default' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {!address.isDefault && (
              <div className="address-controls">
                <button 
                  className="set-default-btn"
                  onClick={() => onSetDefault(address.id)}
                >
                  Thiết lập mặc định
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesTab;