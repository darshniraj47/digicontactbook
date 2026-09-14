import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ContactCard from '../components/ContactCard';
import { contactAPI } from '../services/api';

function Favorites() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contactAPI.getAll({ favorites_only: true });
      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        setError(data.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      setError('Unable to load favorite contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (contactId) => {
    try {
      const res = await contactAPI.toggleFavorite(contactId);
      if (res.success) {
        // If unfavorited, remove from favorites list
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
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

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--dark-sage)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Heart size={26} strokeWidth={2} fill="currentColor" color="var(--primary-sage)" />
                <span>Favorite Contacts</span>
              </h1>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
                Quick access to your most important and frequently used contacts
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

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
              Loading favorite contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Heart size={48} strokeWidth={1.5} color="var(--primary-sage)" />
              </div>
              <h3>No favorite contacts yet</h3>
              <p>
                Mark any contact as a favorite using the heart icon on their card to easily access them here.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary"
              >
                View All Contacts
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

export default Favorites;
