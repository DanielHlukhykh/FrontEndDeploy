import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🏋️</span>
          <span className="navbar__logo-text">FitTrack</span>
        </Link>

        <button className="navbar__burger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar__menu ${mobileOpen ? 'navbar__menu--open' : ''}`}>
          <NavLink to="/" className="navbar__link" onClick={() => setMobileOpen(false)}>
            🏠 Feed
          </NavLink>

          {user ? (
            <>
              <NavLink to="/awards" className="navbar__link" onClick={() => setMobileOpen(false)}>
                🏆 Awards
              </NavLink>
              <NavLink to="/account" className="navbar__link" onClick={() => setMobileOpen(false)}>
                👤 Account
              </NavLink>
              <div className="navbar__user">
                <img src={user.avatarUrl || user.avatar || '/default-avatar.png'} alt="" className="navbar__avatar" />
                <span className="navbar__username">{user.login || user.firstName || user.username || 'User'}</span>
                <button className="navbar__logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__login-btn" onClick={() => setMobileOpen(false)}>
                Log In
              </Link>
              <Link to="/signup" className="navbar__signup-btn" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;