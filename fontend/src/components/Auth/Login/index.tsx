import React, { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/authSlice";
import { decodeJwtToken } from "../../../utils/jwt";

const cx = classNames.bind(styles);

interface FormData {
  Email: string;
  Password: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState<FormData>({ Email: "", Password: "" });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({
    Email: false,
    Password: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFocus = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!data.Email.trim()) errors.Email = "Vui lòng nhập email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email))
      errors.email = "Email không hợp lệ";
    if (!data.Password)
      errors.Password = "Vui lòng nhập mật khẩu";
    if (data.Password.length < 6)
      errors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post("https://localhost:7040/api/Auth/login", {
        Email: data.Email,
        Password: data.Password,
      });

      if (response.data.success) {
        const token = response.data.token;
        const decoded = decodeJwtToken(token);
        if (!decoded) {
          toast.error("Token không hợp lệ");
          return;
        }

        dispatch(loginSuccess({ token, user: decoded }));

        toast.success("Đăng nhập thành công");

        switch (decoded?.role?.toLowerCase()) {
          case "admin":
            navigate("/admin");
            break;
          case "seller":
            try {
              const token = response.data.token;

              const sellerRes = await axios.get("https://localhost:7040/api/seller/me", {
                headers: { Authorization: `Bearer ${token}` },
              });
              const seller = sellerRes.data;

              if (!seller || !seller.sellerId) {
                toast.error("Không tìm thấy thông tin seller");
                return;
              }
              localStorage.setItem('sellerId', seller.sellerId);
              try {
                await axios.get(`https://localhost:7040/api/seller/shops/${seller.sellerId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                navigate("/seller");
              } catch (shopErr: any) {
                if (shopErr.response?.status === 404) {
                  navigate("/create-shop");
                } else {
                  toast.error("Không thể kiểm tra shop");
                  navigate("/seller");
                }
              }
            } catch (sellerErr: any) {
              toast.error("Không thể kiểm tra seller");
              navigate("/seller");
            }
            break;

          default:
            navigate("/");
        }
      } else {
        throw new Error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      toast.error(error?.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("login")}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Đăng nhập tài khoản của bạn</h1>
        <p className={styles.subtitle}>
          Bạn chưa có mật khẩu?{" "}
          <Link to="/signup" className={styles.link}>
            Đăng ký ngay!
          </Link>
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div
              className={cx("inputGroup", {
                hasError: formErrors.Email,
                focused: isFocused.Email || data.Email,
              })}
            >
              <input
                type="email"
                name="Email"
                value={data.Email}
                onChange={handleChange}
                onFocus={() => handleFocus("Email")}
                onBlur={() => handleBlur("Email")}
                required
                className={styles.input}
              />
              <label className={styles.label}>Nhập email</label>
              {formErrors.Email && (
                <span className={styles.error}>{formErrors.Email}</span>
              )}
            </div>

            <div
              className={cx("inputGroup", {
                hasError: formErrors.Password,
                focused: isFocused.Password || data.Password,
              })}
            >
              <input
                type="password"
                name="Password"
                value={data.Password}
                onChange={handleChange}
                onFocus={() => handleFocus("Password")}
                onBlur={() => handleBlur("Password")}
                required
                className={styles.input}
              />
              <label className={styles.label}>Password</label>
              {formErrors.Password && (
                <span className={styles.error}>{formErrors.Password}</span>
              )}
            </div>
          </div>

          {/* Thêm liên kết Quên mật khẩu */}
          <div className={styles.forgotPassword}>
            <Link to="/forgot-password" className={styles.forgotPasswordLink}>
              Bạn đã quên mật khẩu Ư?
            </Link>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Tiếp tục"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;