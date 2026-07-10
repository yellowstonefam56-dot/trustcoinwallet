import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ user, onLogout, onThemeToggle, theme }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">💎</span>
            <span>TrustCoinWallet</span>
          </Link>
        </div>

        <div className="navbar-menu">
          {user && (
            <>
              <Link to="/" className="nav-link">Dashboard</Link>
              {!user.isAdmin && <Link to="/kyc" className="nav-link">KYC</Link>}
              <Link to="/support" className="nav-link">Support</Link>
              {user.isAdmin && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
            </>
          )}
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && (
            <div className="user-menu">
              <span className="user-name">{user.username}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
