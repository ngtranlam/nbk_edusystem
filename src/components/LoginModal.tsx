import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const ok = login(username.trim(), password);
    if (ok) {
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}>&times;</button>

        <div className="login-header">
          <div className="login-logo">
            <img src="/logo-nbk.png" alt="Logo" className="login-logo-img" />
          </div>
          <h2>Đăng nhập Ban Giám Hiệu</h2>
          <p>THCS Nguyễn Bỉnh Khiêm</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Tên đăng nhập</label>
            <div className="login-input-wrap">
              <Icon name="contact" size={16} className="login-input-icon" />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Nhập tên đăng nhập"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Mật khẩu</label>
            <div className="login-input-wrap">
              <Icon name="settings" size={16} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
