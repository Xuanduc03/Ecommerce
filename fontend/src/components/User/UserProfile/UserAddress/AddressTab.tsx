import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home, MapPin, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserAddress.scss';

interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }


const API_URL = 'https://localhost:7040/api/address';

const AddressesTab: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [processing, setProcessing] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const token = localStorage.getItem('authToken');

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải địa chỉ');
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // api get provinces, districts, wards
  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(res.data);
    };
    fetchProvinces();
  }, []);

  const handleCityChange = async (e: any) => {
    const code = Number(e.target.value);
    setFormData(prev => ({ ...prev, city: provinces.find(p => p.code === code)?.name || '' }));
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    setDistricts(res.data.districts);
  };

  const handleDistrictChange = async (e: any) => {
    const code = Number(e.target.value);
    setFormData(prev => ({ ...prev, district: districts.find(d => d.code === code)?.name || '' }));
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    setWards(res.data.wards);
  };

  const handleWardChange = (e: any) => {
    const name = wards.find(w => w.code === Number(e.target.value))?.name || '';
    setFormData(prev => ({ ...prev, ward: name }));
  };


  const handleOpenAdd = () => {
    setCurrentAddress(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (address: Address) => {
    setCurrentAddress(address);
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      street: address.street,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setProcessing(true);
      const addressData = { ...formData };

      if (currentAddress) {
        await axios.put(`${API_URL}/${currentAddress.id}`, addressData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await axios.post(API_URL, addressData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Thêm địa chỉ mới thành công');
      }

      setShowModal(false);
      fetchAddresses();
    } catch (error) {
      toast.error(currentAddress ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
      console.error('Error saving address:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(true);
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      toast.error('Xóa địa chỉ thất bại');
      console.error('Error deleting address:', error);
    } finally {
      setProcessing(false);
      setShowConfirm(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setProcessing(true);
      await axios.put(`${API_URL}/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đặt địa chỉ mặc định thành công');
      fetchAddresses();
    } catch (error) {
      toast.error('Đặt mặc định thất bại');
      console.error('Error setting default address:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải địa chỉ...</p>
      </div>
    );
  }

  return (
    <div className="addresses-section">
      <div className="addresses-header">
        <h2>Địa chỉ của tôi</h2>
        <button className="add-address-btn" onClick={handleOpenAdd} disabled={processing}>
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      </div>

      <div className="addresses-list">
        {addresses.length === 0 ? (
          <div className="empty-address">
            <MapPin size={48} />
            <p>Bạn chưa có địa chỉ nào</p>
            <button className="add-first-btn" onClick={handleOpenAdd} disabled={processing}>
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          <>
            <h3>Danh sách địa chỉ ({addresses.length})</h3>
            {addresses.map((address) => (
              <div key={address.id} className={`address-item ${address.isDefault ? 'default' : ''}`}>
                <div className="address-info">
                  <div className="address-header">
                    <div className="address-type">
                      <MapPin size={16} />
                      <span className="address-name">{address.fullName}</span>
                      {address.isDefault && (
                        <span className="default-badge">
                          <Check size={12} /> Mặc định
                        </span>
                      )}
                    </div>
                    <span className="address-phone">{address.phoneNumber}</span>
                  </div>
                  <div className="address-details">
                    <p>
                      {`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}
                    </p>
                  </div>
                  <div className="address-actions">
                    <button className="action-btn" onClick={() => handleOpenEdit(address)} disabled={processing}>
                      <Edit size={14} /> Sửa
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        setAddressToDelete(address.id);
                        setShowConfirm(true);
                      }}
                      disabled={processing}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                    {!address.isDefault && (
                      <button className="set-default-btn" onClick={() => handleSetDefault(address.id)} disabled={processing}>
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{currentAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} disabled={processing}>
                &times;
              </button>
            </div>

            <div className="address-form">
              <div className="form-group">
                <label>Tên người nhận *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tỉnh/Thành phố *</label>
                <select onChange={handleCityChange}>
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code} selected={province.name === formData.city}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quận/Huyện *</label>
                <select onChange={handleDistrictChange} disabled={!districts.length}>
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code} selected={district.name === formData.district}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Phường/Xã *</label>
                <select onChange={handleWardChange} disabled={!wards.length}>
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code} selected={ward.name === formData.ward}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  Đặt làm mặc định
                </label>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={processing}>
                  Hủy
                </button>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={processing || !formData.fullName || !formData.phoneNumber || !formData.street}
                >
                  {processing ? <Loader2 className="animate-spin" size={18} /> : null}
                  {currentAddress ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Xác nhận xóa */}
      {showConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Xác nhận xóa địa chỉ</h3>
            <p>Bạn có chắc chắn muốn xóa địa chỉ này?</p>
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)} disabled={processing}>
                Hủy
              </button>
              <button
                className="confirm-btn"
                onClick={() => addressToDelete && handleDelete(addressToDelete)}
                disabled={processing}
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesTab;
