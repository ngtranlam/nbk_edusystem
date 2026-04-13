import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import './Header.css';

const Header: React.FC = () => {
  const { isBGH, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevBGH = useRef(isBGH);

  useEffect(() => {
    if (isBGH && !prevBGH.current) {
      setToast('Đăng nhập thành công! Chào mừng Ban Giám Hiệu');
      setTimeout(() => setToast(null), 3500);
    }
    if (!isBGH && prevBGH.current) {
      setToast('Đã đăng xuất');
      setTimeout(() => setToast(null), 2500);
    }
    prevBGH.current = isBGH;
  }, [isBGH]);

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src="/logo-nbk.png" alt="Logo NBK" className="logo-img" />
        </div>
        <div className="header-info">
          <h1 className="header-title">THCS Nguyễn Bỉnh Khiêm</h1>
          {/* <p className="header-subtitle">Hệ thống quản lý giáo dục thông minh</p> */}
        </div>
      </div>
      <div className="header-right">
        <div className="header-contact">
          <div className="contact-icon">📍</div>
          <div className="contact-info">
            <span className="contact-unit">Trường THCS Nguyễn Bỉnh Khiêm</span>
            <span className="contact-location">Xã Cư M'gar, tỉnh Đắk Lắk</span>
          </div>
        </div>
        <div className="header-auth">
          {isBGH ? (
            <>
              <span className="auth-role-badge bgh">Ban Giám Hiệu</span>
              <button className="auth-logout-btn" onClick={logout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <span className="auth-role-badge guest">Chế độ Khách</span>
              <button className="auth-login-btn" onClick={() => setShowLogin(true)}>
                Đăng nhập BGH
              </button>
            </>
          )}
        </div>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      {toast && (
        <div className={`header-toast ${isBGH ? 'success' : 'info'}`}>
          <span>{isBGH ? '✓' : 'ℹ'}</span>
          {toast}
        </div>
      )}
    </header>
  );
};

export default Header;
