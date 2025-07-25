import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Phone, Mail, User, FileText, CreditCard } from 'lucide-react';
import './Checkout.scss'

interface Province {
    code: string;
    name: string;
}

interface District {
    code: string;
    name: string;
}

interface Ward {
    code: string;
    name: string;
}

interface ProvinceDetail {
    districts: District[];
}

interface DistrictDetail {
    wards: Ward[];
}

interface CheckOutFormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    province: string;
    district: string;
    ward: string;
    note: string;
}

const CheckOut: React.FC = () => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [discountCode, setDiscountCode] = useState('');

    const [selectedProvince, setSelectedProvince] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [selectedWard, setSelectedWard] = useState<string>("");
    const [formData, setFormData] = useState<CheckOutFormData>({
        fullName: '',
        phoneNumber: '',
        email: '',
        province: '',
        district: '',
        ward: '',
        note: ''
    });

    // Mock data for provinces (since we can't use external APIs)
    useEffect(() => {
        const mockProvinces = [
            { code: '01', name: 'Hà Nội' },
            { code: '79', name: 'Thành phố Hồ Chí Minh' },
            { code: '48', name: 'Đà Nẵng' },
            { code: '92', name: 'Cần Thơ' },
            { code: '36', name: 'Nam Định' }
        ];
        setProvinces(mockProvinces);
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const mockDistricts = [
                { code: '001', name: 'Quận Ba Đình' },
                { code: '002', name: 'Quận Hoàn Kiếm' },
                { code: '003', name: 'Quận Hai Bà Trưng' },
                { code: '004', name: 'Quận Đống Đa' }
            ];
            setDistricts(mockDistricts);
            setWards([]);
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            const mockWards = [
                { code: '00001', name: 'Phường Phúc Xá' },
                { code: '00002', name: 'Phường Trúc Bạch' },
                { code: '00003', name: 'Phường Vĩnh Phúc' },
                { code: '00004', name: 'Phường Cống Vị' }
            ];
            setWards(mockWards);
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        if (!selectedProvince) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
        if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
        if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10,11}$/;
        if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', {
                ...formData,
                province: selectedProvince,
                district: selectedDistrict,
                ward: selectedWard
            });
            setLoading(false);
            alert('Đặt hàng thành công!');
        }, 2000);
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedProvince(value);
        setSelectedDistrict('');
        setSelectedWard('');
        setFormData(prev => ({ ...prev, province: value, district: '', ward: '' }));
        
        if (errors.province) {
            setErrors(prev => ({ ...prev, province: '' }));
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedDistrict(value);
        setSelectedWard('');
        setFormData(prev => ({ ...prev, district: value, ward: '' }));
        
        if (errors.district) {
            setErrors(prev => ({ ...prev, district: '' }));
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedWard(value);
        setFormData(prev => ({ ...prev, ward: value }));
        
        if (errors.ward) {
            setErrors(prev => ({ ...prev, ward: '' }));
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                {/* Order Summary */}
                <div className="order-summary">
                    <div className="summary-header">
                        <ShoppingCart className="summary-icon" />
                        <h2>Đơn hàng của bạn</h2>
                    </div>
                    
                    <div className="summary-content">
                        <div className="summary-item">
                            <span className="item-label">Tổng tiền hàng</span>
                            <span className="item-value">1.209.999đ</span>
                        </div>
                        
                        <div className="summary-item">
                            <span className="item-label">Phí vận chuyển</span>
                            <span className="item-value free">Miễn phí</span>
                        </div>
                        
                        <div className="discount-section">
                            <div className="discount-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="Nhập mã giảm giá"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="discount-input"
                                />
                                <button type="button" className="apply-discount-btn">
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                        
                        <div className="summary-total">
                            <span className="total-label">Tổng thanh toán</span>
                            <span className="total-amount">1.209.999đ</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="checkout-form-section">
                    <div className="form-header">
                        <h1>Thông tin giao hàng</h1>
                        <p>Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng chính xác</p>
                    </div>

                    <div className="checkout-form">
                        {/* Personal Information */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <User className="section-icon" />
                                Thông tin cá nhân
                            </h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Họ và tên *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={errors.fullName ? 'error' : ''}
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Số điện thoại *</label>
                                    <div className="input-with-icon">
                                        <Phone className="input-icon" />
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={errors.phoneNumber ? 'error' : ''}
                                            placeholder="0901234567"
                                        />
                                    </div>
                                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <div className="input-with-icon">
                                    <Mail className="input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                        placeholder="example@email.com"
                                    />
                                </div>
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <MapPin className="section-icon" />
                                Địa chỉ giao hàng
                            </h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="province">Tỉnh/Thành phố *</label>
                                    <select
                                        id="province"
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                        className={errors.province ? 'error' : ''}
                                    >
                                        <option value="">Chọn tỉnh/thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.province && <span className="error-message">{errors.province}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="district">Quận/Huyện *</label>
                                    <select
                                        id="district"
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        disabled={!selectedProvince}
                                        className={errors.district ? 'error' : ''}
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.district && <span className="error-message">{errors.district}</span>}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="ward">Phường/Xã *</label>
                                <select
                                    id="ward"
                                    value={selectedWard}
                                    onChange={handleWardChange}
                                    disabled={!selectedDistrict}
                                    className={errors.ward ? 'error' : ''}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.ward && <span className="error-message">{errors.ward}</span>}
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="form-section">
                            <h3 className="section-title">
                                <FileText className="section-icon" />
                                Thông tin bổ sung
                            </h3>
                            
                            <div className="form-group">
                                <label htmlFor="note">Ghi chú đặt hàng</label>
                                <textarea
                                    id="note"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="button" 
                            className={`checkout-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="btn-icon" />
                                    Hoàn tất đặt hàng
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckOut;