import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookUser, Settings as SettingsIcon, LogOut } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('contact_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('contact_user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-logo-icon">
          <BookUser size={20} strokeWidth={2.2} />
        </div>
        <span>Digital Contact Book</span>
      </div>

      <div className="nav-user">
        {user && (
          <div className="user-badge">
            <div className="user-avatar-circle">
              {getInitials(user.name)}
            </div>
            <span>{user.name}</span>
          </div>
        )}

        <Link
          to="/settings"
          className="btn btn-secondary btn-sm"
          title="Account Settings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <SettingsIcon size={16} strokeWidth={2} />
          <span>Settings</span>
        </Link>

        <button 
          onClick={handleLogout} 
          className="btn btn-outline btn-sm" 
          title="Log out"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
