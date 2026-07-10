import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import './navbar.scss';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-left" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="Interview AI Logo" className="navbar-logo" />
        <span className="navbar-brand">Interview AI</span>
      </div>
      
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user-welcome">Hello, {user.username}</span>
            <button 
              className="navbar-link-btn" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="navbar-btn logout-btn" 
              onClick={onLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button 
              className="navbar-link-btn" 
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button 
              className="navbar-btn register-btn" 
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
