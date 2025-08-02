import React, { useState } from 'react';
import './ForgotPassword.scss';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://localhost:7040/api/Auth/forgot-password', {
        email,
      });

      if (response.data.success) {
        setSuccess(true);
         
        toast.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
        navigate('/reset-password');
      } else {
        throw new Error(response.data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
      toast.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="reset-password-container">
    <div className="reset-password-card">
      <h1 className="reset-password-title">Đặt lại mật khẩu</h1>
      <p className="reset-password-subtitle">
        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
      </p>
      {success ? (
        <div className="success-message">
          <p>Kiểm tra email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Địa chỉ email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className={error ? 'input-error' : ''}
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            Gửi liên kết đặt lại
          </button>
        </form>
      )}
      <a href="/login" className="back-to-login">
        Quay lại đăng nhập
      </a>
    </div>
  </div>
);
};

export default ForgotPassword;