import React, { useState, type FormEvent, type ChangeEvent } from "react";
import styles from "./SignUp.module.scss";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import bannerBuyer from "../../../assets/images/buyer_dweb_individual.jpg";
import bannerBusiness from "../../../assets/images/buyer_dweb_business.jpg";

interface SignUpData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: number;
  accountType: "personal" | "business";

}

const initialData: SignUpData = {
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: 0,
  accountType: "personal",
};


const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpData>(initialData);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({
    username: false,
    phone: false,
    email: false,
    password: false,
  });

  const handleFocus = (fieldName: string) => {
    setIsFocused(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleBlur = (fieldName: string) => {
    setIsFocused(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAccountTypeChange = (type: "personal" | "business") => {
    setFormData((prev) => ({
      ...prev,
      accountType: type,
      role: type === "personal" ? 0 : 1, // ← 0 và 1 là number
    }));
  };



  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.username))
      newErrors.username = "Tên chỉ được chứa chữ cái và khoảng trắng";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!/^\+?\d{10,15}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axios.post<{ success: boolean; message?: string }>(
        "https://localhost:7040/api/Auth/register",
        formData
      );

      if (response.data.success) {
        toast.success("Đăng ký thành công");
        if (rememberMe) {
          localStorage.setItem("userEmail", formData.email);
        }
        navigate("/");
      } else {
        toast.error(response.data.message || "Không thể đăng ký");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Lỗi kết nối, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signup}>
      <div className={styles.header}>
        <svg xmlns="http://www.w3.org/2000/svg" width="117" height="48" viewBox="0 0 122 48.592" id="gh-logo" aria-labelledby="ebayLogoTitle"><title id="ebayLogoTitle">eBay Home</title><g><path fill="#F02D2D" d="M24.355 22.759c-.269-5.738-4.412-7.838-8.826-7.813-4.756.026-8.544 2.459-9.183 7.915zM6.234 26.93c.364 5.553 4.208 8.814 9.476 8.785 3.648-.021 6.885-1.524 7.952-4.763l6.306-.035c-1.187 6.568-8.151 8.834-14.145 8.866C4.911 39.844.043 33.865-.002 25.759c-.05-8.927 4.917-14.822 15.765-14.884 8.628-.048 14.978 4.433 15.033 14.291l.01 1.625z"></path><path fill="#0968F6" d="M46.544 35.429c5.688-.032 9.543-4.148 9.508-10.32s-3.947-10.246-9.622-10.214-9.543 4.148-9.509 10.32 3.974 10.245 9.623 10.214zM30.652.029l6.116-.034.085 15.369c2.978-3.588 7.1-4.65 11.167-4.674 6.817-.037 14.412 4.518 14.468 14.454.045 8.29-5.941 14.407-14.422 14.454-4.463.026-8.624-1.545-11.218-4.681a33.237 33.237 0 01-.19 3.731l-5.994.034c.09-1.915.185-4.364.174-6.322z"></path><path fill="#FFBD14" d="M77.282 25.724c-5.548.216-8.985 1.229-8.965 4.883.013 2.365 1.94 4.919 6.7 4.891 6.415-.035 9.826-3.556 9.794-9.289v-.637c-2.252.02-5.039.054-7.529.152zm13.683 7.506c.01 1.778.071 3.538.232 5.1l-5.688.032a33.381 33.381 0 01-.225-3.825c-3.052 3.8-6.708 4.909-11.783 4.938-7.532.042-11.585-3.915-11.611-8.518-.037-6.665 5.434-9.049 14.954-9.318 2.6-.072 5.529-.1 7.945-.116v-.637c-.026-4.463-2.9-6.285-7.854-6.257-3.68.021-6.368 1.561-6.653 4.2l-6.434.035c.645-6.566 7.53-8.269 13.595-8.3 7.263-.04 13.406 2.508 13.448 10.192z"></path><path fill="#92C821" d="M91.939 19.852l-4.5-8.362 7.154-.04 10.589 20.922 10.328-21.02 6.486-.048-18.707 37.251-6.85.039 5.382-10.348-9.887-18.393"></path></g></svg>
        <div className={styles.signInContainer}>
          <span>Bạn đã có tài khoản?</span>
          <Link to="/login" className={styles.signInLink}>
            Đăng nhập
          </Link>
        </div>
      </div>

      <div className={styles.formContainer}>
        <img
          src={formData.accountType === "personal" ? bannerBuyer : bannerBusiness}
          alt="Banner"
          className={styles.bannerImage}
        />
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Tạo tài khoản</h1>

          <div className={styles.accountTypes}>
            <button
              type="button"
              className={`${styles.accountTypeBtn} ${formData.accountType === "personal" ? styles.active : ""
                }`}
              onClick={() => handleAccountTypeChange("personal")}
            >
              Personal
            </button>
            <button
              type="button"
              className={`${styles.accountTypeBtn} ${formData.accountType === "business" ? styles.active : ""
                }`}
              onClick={() => handleAccountTypeChange("business")}
            >
              Business
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formFields}>
              <div
                className={`${styles.inputGroup} ${formErrors.username ? styles.hasError : ''
                  } ${isFocused.username || formData.username ? styles.focused : ''
                  }`}
              >

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => handleFocus('username')}
                  onBlur={() => handleBlur('username')}
                  required
                  className={styles.input}
                />
                <label className={styles.label}>{formData.accountType === "personal" ? "Full Name" : "Business Name"}</label>
                {formErrors.username && (
                  <span className={styles.error}>{formErrors.username}</span>
                )}
              </div>

              <div
                className={`${styles.inputGroup} ${formErrors.phoneNumber ? styles.hasError : ''
                  } ${isFocused.phoneNumber || formData.phoneNumber ? styles.focused : ''
                  }`}
              >
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onFocus={() => handleFocus('phoneNumber')}
                  onBlur={() => handleBlur('phoneNumber')}
                  required
                  className={styles.input}
                />
                <label className={styles.label}>{formData.accountType === "personal" ? "Phone Number" : "Business Phone"}</label>
                {formErrors.phoneNumber && (
                  <span className={styles.error}>{formErrors.phoneNumber}</span>
                )}
              </div>

              <div
                className={`${styles.inputGroup} ${formErrors.email ? styles.hasError : ''
                  } ${isFocused.email || formData.email ? styles.focused : ''
                  }`}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  required
                  className={styles.input}
                />
                <label className={styles.label}>{formData.accountType === "personal" ? "Email" : "Business Email"}</label>
                {formErrors.email && (
                  <span className={styles.error}>{formErrors.email}</span>
                )}
              </div>

              <div
                className={`${styles.inputGroup} ${formErrors.password ? styles.hasError : ''
                  } ${isFocused.password || formData.password ? styles.focused : ''
                  }`}
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  required
                  className={styles.input}
                />
                <label className={styles.label}>Password</label>
                {formErrors.password && (
                  <span className={styles.error}>{formErrors.password}</span>
                )}
              </div>
            </div>

            <div className={styles.terms}>
              By selecting Create personal account, you agree to our{" "}
              <Link to="/terms">User Agreement</Link> and acknowledge reading our{" "}
              <Link to="/privacy">User Privacy Notice</Link>.
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Đang đăng ký..." : `Create ${formData.accountType} account`}
            </button>

            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <div className={styles.socialButtons}>
              <button type="button" className={styles.socialBtn}>
                <img src="/google-icon.svg" alt="Google" />
                Google
              </button>
              <button type="button" className={styles.socialBtn}>
                <img src="/facebook-icon.svg" alt="Facebook" />
                Facebook
              </button>
              <button type="button" className={styles.socialBtn}>
                <img src="/apple-icon.svg" alt="Apple" />
                Apple
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SignUp;