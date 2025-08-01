import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Wallet
} from "lucide-react";
import "./Checkout.scss";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { CartItemProps } from "../Carts/CartItem";

// Interface cho CartItem
export interface CartItem {
  _id: string;
  productName: string;
  images: string[];
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  originalPrice?: number;
}

interface Province { code: string; name: string; }
interface District { code: string; name: string; }
interface Ward { code: string; name: string; }
interface CheckOutFormData {
  street: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  note: string;
  paymentMethod: string;
}

const CheckOut: React.FC = () => {
  const { state } = useLocation();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discountCode, setDiscountCode] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any | null>(null);
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
    street: '', // <-- thêm dòng này
    note: '',
    paymentMethod: 'cod' // Mặc định là COD
  });

  const navigate = useNavigate();

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: Banknote,
      popular: true
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua tài khoản ngân hàng',
      icon: Building2,
      popular: false
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua cổng VNPay',
      icon: CreditCard,
      popular: true
    }
  ];


  const token = localStorage.getItem("authToken");

  const fetchAddress = async () => {
    try {
      const response = await axios.get("https://localhost:7040/api/address", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const addressList = response.data;
      if (addressList == 0) {
        navigate('/profile');
        toast.error("Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ trước khi đặt hàng.");
      }
      setAddresses(addressList);
      const defaultAddr = addressList.find((addr: any) => addr.isDefault);
      setDefaultAddress(defaultAddr);

      if (defaultAddr) {
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddr.fullName,
          phoneNumber: defaultAddr.phoneNumber,
          province: defaultAddr.city,
          district: defaultAddr.district,
          ward: defaultAddr.ward,
        }));
        setSelectedProvince(defaultAddr.city);
        setSelectedDistrict(defaultAddr.district);
        setSelectedWard(defaultAddr.ward);
      }

    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Không thể tải địa chỉ giao hàng.");
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  useEffect(() => {
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setDefaultAddress(defaultAddr);
      setFormData({
        ...formData,
        fullName: defaultAddr.fullName,
        phoneNumber: defaultAddr.phoneNumber,
        street: defaultAddr.street,
      });
      setSelectedProvince(defaultAddr.city);
      setSelectedDistrict(defaultAddr.district);
      setSelectedWard(defaultAddr.ward);
    }
  }, [addresses]);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!selectedProvince) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePaymentMethodChange = (methodId: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: methodId }));
    if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
  };

  const cartItems = useSelector((state: any) => state.cart.items);
  const totalPrice = cartItems.reduce(
    (sum: number, item: CartItemProps["item"]) => sum + item.price * item.quantity,
    0
  );


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Bước 1: Tạo order trước
      const orderResponse = await axios.post(
        "https://localhost:7040/api/order",
        {
          shippingAddressId: defaultAddress?.id,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          province: selectedProvince,
          district: selectedDistrict,
          ward: selectedWard,
          street: formData.street,
          cartItems: cartItems,
          totalPrice: totalPrice,
          paymentMethod: formData.paymentMethod,
          note: formData.note,
          status: formData.paymentMethod === 'cod' ? 'confirmed' : 'pending' // COD thì confirmed, online payment thì pending
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fix: orderId trả về là array, lấy phần tử đầu tiên
      const orderId = Array.isArray(orderResponse.data.orderId)
        ? orderResponse.data.orderId[0]
        : orderResponse.data.orderId || orderResponse.data.id;

      console.log("Order created:", orderResponse.data);
      console.log("Extracted orderId:", orderId);

      // Bước 2: Xử lý theo phương thức thanh toán
      if (formData.paymentMethod === 'vnpay') {
        // Thanh toán qua VNPay - Fix: wrap trong object request
        const paymentRequest = {
          request: {
            orderId: orderId,
            amount: totalPrice,
            orderInfo: `Thanh toán đơn hàng ${orderId}`,
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phoneNumber
          }
        };

        const paymentResponse = await axios.post(
          "https://localhost:7040/api/payment/create-payment",
          paymentRequest,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.data.success) {
          // Redirect đến VNPay
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          throw new Error(paymentResponse.data.message || 'Không thể tạo link thanh toán');
        }
      }
      else if (formData.paymentMethod === 'banking') {
        // Chuyển khoản ngân hàng - hiển thị thông tin TK
        toast.success("Đặt hàng thành công! Vui lòng chuyển khoản theo thông tin được gửi qua email.");
        navigate('/order-success', {
          state: {
            orderId: orderId,
            paymentMethod: 'banking',
            bankInfo: {
              bankName: 'Vietcombank',
              accountNumber: '1234567890',
              accountName: 'CÔNG TY ABC',
              amount: totalPrice,
              content: `DH ${orderId}`
            }
          }
        });
      }
      else {
        // COD - chuyển đến trang thành công
        toast.success("Đặt hàng thành công!");
        navigate('/order-success', {
          state: {
            orderId: orderId,
            paymentMethod: 'cod'
          }
        });
      }

    } catch (error: any) {
      console.error("Error placing order:", error);

      // Xử lý lỗi chi tiết
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Thông tin đặt hàng không hợp lệ.");
      } else if (error.response?.status === 500) {
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau.");
      } else {
        toast.error(error.message || "Đặt hàng thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm component hiển thị thông tin chuyển khoản (tùy chọn)
  const BankingInfo: React.FC<{ bankInfo: any }> = ({ bankInfo }) => {
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép!");
    };

    return (
      <div className="banking-info">
        <h3>Thông tin chuyển khoản</h3>
        <div className="bank-details">
          <div className="bank-item">
            <span>Ngân hàng:</span>
            <strong>{bankInfo.bankName}</strong>
          </div>
          <div className="bank-item">
            <span>Số tài khoản:</span>
            <strong onClick={() => copyToClipboard(bankInfo.accountNumber)}>
              {bankInfo.accountNumber} 📋
            </strong>
          </div>
          <div className="bank-item">
            <span>Chủ tài khoản:</span>
            <strong>{bankInfo.accountName}</strong>
          </div>
          <div className="bank-item">
            <span>Số tiền:</span>
            <strong onClick={() => copyToClipboard(bankInfo.amount.toString())}>
              {bankInfo.amount.toLocaleString()}đ 📋
            </strong>
          </div>
          <div className="bank-item">
            <span>Nội dung:</span>
            <strong onClick={() => copyToClipboard(bankInfo.content)}>
              {bankInfo.content} 📋
            </strong>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <div className="order-summary">
          <div className="summary-header">
            <ShoppingCart className="summary-icon" />
            <h2>Đơn hàng của bạn</h2>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="item-label">Tổng tiền hàng</span>
              <span className="item-value">{totalPrice.toLocaleString()}đ</span>
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
                <button type="button" className="apply-discount-btn">Áp dụng</button>
              </div>
            </div>
            <div className="summary-total">
              <span className="total-label">Tổng thanh toán</span>
              <span className="total-amount">{totalPrice.toLocaleString()}đ</span>
            </div>
            {/* Hiển thị danh sách sản phẩm để người dùng xem xét */}
            <div className="order-items">
              {cartItems.map((item: any) => (
                <div key={item._id} className="order-item">
                  <span>{item.productName} (x{item.quantity})</span>
                  <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="checkout-form-section">
          <div className="form-header">
            <h1>Thông tin giao hàng</h1>
            <p>Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng chính xác</p>
          </div>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3 className="section-title"><User className="section-icon" />Thông tin cá nhân</h3>
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

            <div className="form-section">
              <h3 className="section-title"><MapPin className="section-icon" />Địa chỉ giao hàng</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={defaultAddress?.provinceName || ''}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện *</label>
                  <input
                    type="text"
                    value={defaultAddress?.districtName || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phường/Xã *</label>
                <input
                  type="text"
                  value={defaultAddress?.wardName || ''}
                  disabled
                />
              </div>

            </div>

            {/* PHẦN MỚI: Phương thức thanh toán */}
            <div className="form-section">
              <h3 className="section-title">
                <CreditCard className="section-icon" />
                Phương thức thanh toán *
              </h3>
              <div className="payment-methods">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`payment-method ${formData.paymentMethod === method.id ? 'selected' : ''} ${method.popular ? 'popular' : ''}`}
                      onClick={() => handlePaymentMethodChange(method.id)}
                    >
                      <div className="payment-method-content">
                        <div className="payment-method-header">
                          <div className="payment-method-icon">
                            <Icon size={24} />
                          </div>
                          <div className="payment-method-info">
                            <h4 className="payment-method-name">
                              {method.name}
                              {method.popular && <span className="popular-badge">Phổ biến</span>}
                            </h4>
                            <p className="payment-method-description">{method.description}</p>
                          </div>
                        </div>
                        <div className="payment-method-radio">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={() => handlePaymentMethodChange(method.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
            </div>

            <div className="form-section">
              <h3 className="section-title"><FileText className="section-icon" />Thông tin bổ sung</h3>
              <div className="form-group">
                <label htmlFor="note">Ghi chú đặt hàng</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hoặc chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  rows={4}
                />
              </div>
            </div>

            <button type="submit" className={`checkout-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div> Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="btn-icon" /> Hoàn tất đặt hàng
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );


};

export default CheckOut;