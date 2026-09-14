import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Heart, Contact } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import { contactAPI } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const userStr = localStorage.getItem('contact_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const data = await contactAPI.getAll(params);
      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        setError(data.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Unable to load contacts. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleToggleFavorite = async (contactId) => {
    try {
      const res = await contactAPI.toggleFavorite(contactId);
      if (res.success) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId ? { ...c, is_favorite: res.is_favorite } : c
          )
        );
      }
    } catch (err) {
      alert('Error updating favorite status');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const res = await contactAPI.delete(contactId);
      if (res.success) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
      } else {
        alert(res.message || 'Could not delete contact');
      }
    } catch (err) {
      alert('Error deleting contact');
    }
  };

  const totalCount = contacts.length;
  const favoriteCount = contacts.filter((c) => c.is_favorite).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-container">
          {/* Welcome Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--dark-sage)', fontWeight: 700 }}>
                Hello, {user ? user.name : 'User'}
              </h1>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
                Manage and organize your personal and professional contacts
              </p>
            </div>
            <button
              onClick={() => navigate('/add-contact')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserPlus size={18} strokeWidth={2.2} />
              <span>Add New Contact</span>
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Contacts</h3>
                <div className="stat-number">{totalCount}</div>
              </div>
              <div className="stat-icon-wrapper">
                <Users size={24} strokeWidth={2} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Favorite Contacts</h3>
                <div className="stat-number">{favoriteCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ color: 'var(--primary-sage)' }}>
                <Heart size={24} strokeWidth={2} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Search and Category Filter */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {error && <div className="alert alert-error">{error}</div>}

          {/* Contacts List Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Contact size={48} strokeWidth={1.5} />
              </div>
              <h3>No contacts found</h3>
              <p>
                {searchQuery || selectedCategory !== 'All'
                  ? 'No contacts match your current search or filter criteria.'
                  : 'No contacts added yet. Start by creating your first contact!'}
              </p>
              <button
                onClick={() => navigate('/add-contact')}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <UserPlus size={18} strokeWidth={2.2} />
                <span>Add Contact</span>
              </button>
            </div>
          ) : (
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
