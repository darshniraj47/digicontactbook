import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Heart, UserPlus, Settings as SettingsIcon, LogOut } from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('contact_user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Digital Contact Book</div>
        <div className="sidebar-subtitle">Personal Contact Manager</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Home size={20} strokeWidth={2} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/favorites" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Heart size={20} strokeWidth={2} />
          <span>Favorites</span>
        </NavLink>

        <NavLink 
          to="/add-contact" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <UserPlus size={20} strokeWidth={2} />
          <span>Add Contact</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <SettingsIcon size={20} strokeWidth={2} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
