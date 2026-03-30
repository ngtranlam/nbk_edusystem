import React from 'react';
import './Header.css';

const Header: React.FC = () => {
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
      </div>
    </header>
  );
};

export default Header;
