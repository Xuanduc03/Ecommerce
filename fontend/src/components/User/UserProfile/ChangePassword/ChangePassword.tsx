import React, { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, Shield, Check, X } from 'lucide-react';
import './ChangePassword.scss';
import axios from 'axios';
import { toast } from 'react-toastify';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm: React.FC = () => {
  const token = localStorage.getItem('authToken');
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Hàm kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = (password: string) => {
    const requirements = [
      { test: /.{8,}/, label: 'Ít nhất 8 ký tự' },
      { test: /[A-Z]/, label: 'Chữ hoa' },
      { test: /[a-z]/, label: 'Chữ thường' },
      { test: /\d/, label: 'Số' },
      { test: /[!@#$%^&*(),.?":{}|<>]/, label: 'Ký tự đặc biệt' },
    ];

    const passed = requirements.filter(req => req.test.test(password));
    return {
      score: passed.length,
      requirements: requirements.map(req => ({
        ...req,
        passed: req.test.test(password),
      })),
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordStrength.score < 4) {
      newErrors.newPassword = 'Mật khẩu chưa đủ mạnh';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        'https://localhost:7040/api/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          ConfirmNewPassword : formData.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json"
            , Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.data;

      if (!data.Success) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      } else {
        toast.success('Đổi mật khẩu thành công!');
      }
      setShowSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="change-password-container">
      {showSuccess && (
        <div className="success-message">
          <div className="success-content">
            <Check className="success-icon" />
            <span>Đổi mật khẩu thành công!</span>
          </div>
        </div>
      )}

      <div className="change-password-card">
        {/* Giữ nguyên phần header */}

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password Field */}
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <div className={`input-wrapper ${errors.currentPassword ? 'error' : ''}`}>
              <Lock className="input-icon" />
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          {/* New Password Field */}
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className={`input-wrapper ${errors.newPassword ? 'error' : ''}`}>
              <Lock className="input-icon" />
              <input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Nhập mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.score <= 2 ? '#ef4444' :
                        passwordStrength.score <= 3 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
                <span className="strength-text">
                  {passwordStrength.score <= 2 ? 'Yếu' :
                    passwordStrength.score <= 3 ? 'Trung bình' : 'Mạnh'}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="password-requirements">
                {passwordStrength.requirements.map((req, index) => (
                  <div key={index} className={`requirement ${req.passed ? 'passed' : ''}`}>
                    {req.passed ? (
                      <Check size={14} className="req-icon" />
                    ) : (
                      <X size={14} className="req-icon" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}

            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
              <Lock className="input-icon" />
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </form>

        {/* Giữ nguyên phần security tips */}
      </div>
    </div>
  );
};

export default ChangePasswordForm;