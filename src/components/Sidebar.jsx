import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/orders', icon: '📦', label: 'Orders' },
    { path: '/chats', icon: '💬', label: 'Chats' },
    { path: '/price-list', icon: '💰', label: 'Price List' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚽</span>
            <h2>MASTOI SPORTS</h2>
          </div>
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={closeMobileMenu}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <div className="made-by">
            Made by <strong>GAUTAMS Worlds</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;