import React, { useState, useEffect } from 'react';
import style from './Checkout.module.scss';
import classNames from 'classnames/bind';
import axios from 'axios';

const cx = classNames.bind(style);
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

    // 🏙️ Fetch danh sách tỉnh
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get<Province[]>('https://provinces.open-api.vn/api/');
                setProvinces(response.data);
            } catch (error) {
                console.error("Lỗi lấy danh sách tỉnh: ", error);
            }
        }
        fetchProvinces();
    }, []);

    // 🏡 Khi chọn tỉnh -> Fetch huyện
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedProvince) {
                try {
                    const response = await axios.get<ProvinceDetail>(
                        `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
                    );
                    setDistricts(response.data.districts);
                } catch (error) {
                    console.error("Lỗi lấy huyện: ", error);
                }
            } else {
                setDistricts([]);
                setWards([]);
            }
        };

        fetchDistricts();
    }, [selectedProvince]);

    // 🏠 Khi chọn huyện -> Fetch xã
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedDistrict) {
                try {
                    const response = await axios.get<DistrictDetail>(
                        `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
                    );
                    setWards(response.data.wards);
                } catch (error) {
                    console.error("Lỗi lấy xã: ", error);
                }
            } else {
                setWards([]);
            }
        };

        fetchWards();
    }, [selectedDistrict]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formData);
  };

  // Handle select changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
    setFormData(prev => ({ ...prev, province: e.target.value }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setFormData(prev => ({ ...prev, district: e.target.value }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
    setFormData(prev => ({ ...prev, ward: e.target.value }));
  };

    return (
        <div className={cx('container')}>
            <h1 className={cx('checkout-title')}>Thông tin đặt hàng</h1>

            <div className={cx("cart-summary")}>
                <h2>Tổng cộng</h2>
                <div className={cx("summary-row")}>
                    <span>Số lượng </span>
                    <span>1209999đ</span>
                </div>
                <div className={cx("summary-row")}>
                    <span>Giao hàng</span>
                    <p>Miễn phí ship</p>
                </div>
                <div className={cx("summary-row")}>
                    <span>Giảm giá</span>
                    <input type="text" placeholder="Enter your code" />
                </div>
                <div className={cx("summary-total")}>
                    <span>Thành tiền</span>
                    <span className={cx("total-price")}>1209999đ</span>
                </div>
            </div>

            <form action="">
                <div className={cx("form-group")}>
                    <div className={cx("input-group")}>
                        <label htmlFor="">Họ và tên</label>
                        <input type="text" name='fullName' />
                    </div>
                    <div className={cx("input-group")}>
                        <label htmlFor="">Số điện thoại</label>
                        <input type="text" name='phoneNumber' />
                    </div>
                </div>

                <div className={cx("form-group")}>
                    <div className={cx("input-group")}>
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="" />
                    </div>

                    <div className={cx("input-group")}>
                        {/* Chọn Tỉnh */}
                        <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                            <option value="">Chọn tỉnh/thành phố</option>
                            {provinces.map((province) => (
                                <option key={province.code} value={province.code}>
                                    {province.name}
                                </option>
                            ))}
                        </select>

                        {/* Chọn Huyện */}
                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince}>
                            <option value="">Chọn quận/huyện</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>

                        {/* Chọn Xã */}
                        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                            <option value="">Chọn phường/xã</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={cx("input-group")}>
                        <label htmlFor="note">Ghi chú </label>
                        <input type="note" name="note" id="" />
                    </div>
                </div>

                <button className={cx('checkout-btn')}>Đặt hàng</button>
            </form>

            <div className={cx("payment-option")}>

            </div>

        </div>
    );
}

export default CheckOut;