import React, { useState } from "react";
import axios from "axios";
import "./ResetPassword.scss";
import { useNavigate } from "react-router-dom";

const ResetPasswordFlow = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const  navigate = useNavigate();
  const handleResetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("https://localhost:7040/api/auth/reset-password", {
        token,
        newPassword,
      });

      setMessage("✅ Đặt lại mật khẩu thành công. Hãy đăng nhập lại.");
      navigate("/login");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "❌ Lỗi khi đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-wrapper">
      <h2 className="title">Xác nhận đặt lại mật khẩu</h2>

      {message && (
        <p
          className={
            message.startsWith("✅")
              ? "success-message"
              : "error-message"
          }
        >
          {message}
        </p>
      )}

      <div className="form-group">
        <label>Mã xác thực (OTP)</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Nhập mã OTP từ email"
        />
      </div>

      <div className="form-group">
        <label>Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
        />
      </div>

      <div className="form-group">
        <label>Xác nhận mật khẩu</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      <button
        className="submit-button"
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Xác nhận đặt lại mật khẩu"}
      </button>
    </div>
  );
};

export default ResetPasswordFlow;
