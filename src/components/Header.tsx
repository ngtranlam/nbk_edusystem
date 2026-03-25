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
          <p className="header-subtitle">Đề tài: Hệ thống quản lý giáo dục thông minh</p>
        </div>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="user-avatar">GV</div>
          <div className="user-info">
            <span className="user-name">Giáo viên</span>
            <span className="user-role">GVCN</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
