import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Sliders, 
  Download, 
  AlertTriangle, 
  LogOut, 
  Trash2, 
  Check, 
  Bell 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { profileAPI, contactAPI } from '../services/api';

const CATEGORIES = ['Family', 'Friends', 'College', 'Work', 'Other'];

function Settings() {
  const navigate = useNavigate();

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    default_category: 'Other',
    contact_reminders: true,
  });
  const [prefMsg, setPrefMsg] = useState({ type: '', text: '' });
  const [prefLoading, setPrefLoading] = useState(false);

  // Export State
  const [exportLoading, setExportLoading] = useState(false);

  // Delete Account State
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // 1. Load Profile
    profileAPI.getProfile().then((res) => {
      if (res.success && res.user) {
        setProfileData({
          name: res.user.name || '',
          email: res.user.email || '',
        });
      }
    }).catch(() => {
      const userStr = localStorage.getItem('contact_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setProfileData({ name: u.name || '', email: u.email || '' });
      }
    });

    // 2. Load Preferences
    profileAPI.getPreferences().then((res) => {
      if (res.success && res.preferences) {
        setPreferences({
          default_category: res.preferences.default_category || 'Other',
          contact_reminders: res.preferences.contact_reminders ?? true,
        });
      }
    }).catch(() => {});
  }, []);

  // 1. Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await profileAPI.updateProfile(profileData);
      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        // Update stored user
        const userStr = localStorage.getItem('contact_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.name = profileData.name;
          user.email = profileData.email;
          localStorage.setItem('contact_user', JSON.stringify(user));
        }
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Error updating profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Handle Password Change
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await profileAPI.changePassword(passwordData);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' });
      } else {
        setPasswordMsg({ type: 'error', text: res.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Error changing password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // 3. Handle Preferences Update
  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    setPrefMsg({ type: '', text: '' });

    try {
      const res = await profileAPI.updatePreferences(preferences);
      if (res.success) {
        setPrefMsg({ type: 'success', text: 'Contact preferences saved successfully!' });
      } else {
        setPrefMsg({ type: 'error', text: res.message || 'Failed to save preferences.' });
      }
    } catch (err) {
      setPrefMsg({ type: 'error', text: err.response?.data?.message || 'Error saving preferences.' });
    } finally {
      setPrefLoading(false);
    }
  };

  // 4. Handle Export Contacts (CSV)
  const handleExportContacts = async () => {
    setExportLoading(true);
    try {
      const data = await contactAPI.getAll();
      if (!data.success || !data.contacts || data.contacts.length === 0) {
        alert('You do not have any contacts to export yet.');
        setExportLoading(false);
        return;
      }

      // Generate CSV string
      const headers = ['Name', 'Phone', 'Email', 'Address', 'Category', 'Favorite', 'Created Date'];
      const rows = data.contacts.map((c) => [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${(c.category || 'Other').replace(/"/g, '""')}"`,
        c.is_favorite ? 'Yes' : 'No',
        `"${c.created_at || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'my_contacts_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export contacts. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // 5. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('contact_user');
    navigate('/login');
  };

  // 6. Handle Delete Account
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await profileAPI.deleteAccount();
      if (res.success) {
        alert('Your account and contacts have been permanently deleted.');
        localStorage.removeItem('contact_user');
        navigate('/login');
      } else {
        alert(res.message || 'Failed to delete account.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting account.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--dark-sage)', fontWeight: 700 }}>
              Settings
            </h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
              Manage your account credentials, contact preferences, and data exports.
            </p>
          </div>

          {/* 1. Profile Information */}
          <div className="form-page-card" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            <div className="form-page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={20} color="var(--primary-sage)" />
              <div>
                <h2>Profile Information</h2>
                <p>Update your personal account details</p>
              </div>
            </div>

            {profileMsg.text && (
              <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {profileMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />} {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="prof_name">Full Name</label>
                <input
                  type="text"
                  id="prof_name"
                  className="form-control"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof_email">Email Address</label>
                <input
                  type="email"
                  id="prof_email"
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary">
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password */}
          <div className="form-page-card" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            <div className="form-page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={20} color="var(--primary-sage)" />
              <div>
                <h2>Change Password</h2>
                <p>Ensure your account remains secure with a strong password</p>
              </div>
            </div>

            {passwordMsg.text && (
              <div className={`alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />} {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="curr_pass">Current Password</label>
                <input
                  type="password"
                  id="curr_pass"
                  className="form-control"
                  placeholder="Enter current password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_pass">New Password</label>
                <input
                  type="password"
                  id="new_pass"
                  className="form-control"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="conf_new_pass">Confirm New Password</label>
                <input
                  type="password"
                  id="conf_new_pass"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={passwordData.confirm_new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" disabled={passwordLoading} className="btn btn-primary">
                  {passwordLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* 3. Contact Preferences & Notifications */}
          <div className="form-page-card" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            <div className="form-page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sliders size={20} color="var(--primary-sage)" />
              <div>
                <h2>Contact Preferences</h2>
                <p>Customize default values when adding new contacts</p>
              </div>
            </div>

            {prefMsg.text && (
              <div className={`alert ${prefMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {prefMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />} {prefMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePreferences}>
              <div className="form-group">
                <label htmlFor="def_cat">Default Contact Category</label>
                <select
                  id="def_cat"
                  className="form-control"
                  value={preferences.default_category}
                  onChange={(e) => setPreferences({ ...preferences, default_category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
                  Newly added contacts will automatically pre-select this category.
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} color="var(--primary-sage)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>Contact Reminders</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                        Enable reminder alerts for important contacts
                      </div>
                    </div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.contact_reminders}
                      onChange={(e) => setPreferences({ ...preferences, contact_reminders: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary-sage)', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" disabled={prefLoading} className="btn btn-primary">
                  {prefLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>

          {/* 4. Data Management (Export) */}
          <div className="form-page-card" style={{ maxWidth: '100%', marginBottom: '1.5rem' }}>
            <div className="form-page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Download size={20} color="var(--primary-sage)" />
              <div>
                <h2>Data Management</h2>
                <p>Download and backup your contact directory</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Export Contacts as CSV</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
                  Download a complete spreadsheet file containing all your contacts, phones, and emails.
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportContacts}
                disabled={exportLoading}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} strokeWidth={2} />
                <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* 5. Danger Zone */}
          <div className="form-page-card" style={{ maxWidth: '100%', borderColor: 'var(--error-border)' }}>
            <div className="form-page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={20} color="var(--error-text)" />
              <div>
                <h2 style={{ color: 'var(--error-text)' }}>Danger Zone</h2>
                <p>Irreversible actions related to your account session and data</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sign Out of Session</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--secondary-text)' }}>
                    End your active login session on this browser.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <LogOut size={16} strokeWidth={2} />
                  <span>Logout</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--error-text)' }}>Delete Account & Contacts</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--secondary-text)' }}>
                    Permanently delete your profile and all personal contacts. This action cannot be undone.
                  </div>
                </div>
                {!deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="btn btn-danger"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                    <span>Delete Account</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="btn btn-danger btn-sm"
                    >
                      {deleteLoading ? 'Deleting...' : 'Confirm Delete Account'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;
