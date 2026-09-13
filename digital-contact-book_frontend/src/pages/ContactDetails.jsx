import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Phone, Mail, MapPin, Calendar, Tag, Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { contactAPI } from '../services/api';

function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await contactAPI.getById(id);
        if (response.success && response.contact) {
          setContact(response.contact);
        } else {
          setError(response.message || 'Contact not found');
        }
      } catch (err) {
        setError('Error fetching contact details');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        const res = await contactAPI.delete(id);
        if (res.success) {
          navigate('/dashboard');
        } else {
          alert(res.message || 'Could not delete contact');
        }
      } catch (err) {
        alert('Error deleting contact');
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await contactAPI.toggleFavorite(id);
      if (res.success) {
        setContact((prev) => ({ ...prev, is_favorite: res.is_favorite }));
      }
    } catch (err) {
      alert('Error updating favorite status');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} strokeWidth={2} />
              <span>Back to Contacts</span>
            </button>
          </div>

          {error && <div className="alert alert-error">?? {error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
              Loading contact details...
            </div>
          ) : contact ? (
            <div className="details-card">
              <div className="details-header">
                <div className="details-avatar">
                  {getInitials(contact.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.6rem', color: 'var(--dark-sage)', fontWeight: 700 }}>
                      {contact.name}
                    </h2>
                    <button
                      onClick={handleToggleFavorite}
                      className={`fav-btn ${contact.is_favorite ? 'active' : ''}`}
                      title="Toggle Favorite"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Heart 
                        size={26} 
                        strokeWidth={2} 
                        fill={contact.is_favorite ? 'currentColor' : 'none'} 
                      />
                    </button>
                  </div>
                  <span className="category-tag">{contact.category || 'Other'}</span>
                </div>
              </div>

              <div className="details-grid">
                <div>
                  <div className="details-field-label">Phone Number</div>
                  <div className="details-field-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} color="var(--primary-sage)" />
                    <span>{contact.phone}</span>
                  </div>
                </div>

                <div>
                  <div className="details-field-label">Email Address</div>
                  <div className="details-field-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} color="var(--primary-sage)" />
                    <span>{contact.email ? contact.email : <span style={{ color: 'var(--secondary-text)' }}>Not provided</span>}</span>
                  </div>
                </div>

                <div>
                  <div className="details-field-label">Category</div>
                  <div className="details-field-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} color="var(--primary-sage)" />
                    <span>{contact.category || 'Other'}</span>
                  </div>
                </div>

                <div>
                  <div className="details-field-label">Date Added</div>
                  <div className="details-field-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--primary-sage)" />
                    <span>{contact.created_at || 'Recently'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div className="details-field-label">Address / Notes</div>
                <div className="details-field-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', whiteSpace: 'pre-wrap', marginTop: '0.35rem' }}>
                  <MapPin size={16} color="var(--primary-sage)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>{contact.address ? contact.address : <span style={{ color: 'var(--secondary-text)' }}>No address or notes provided.</span>}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button
                  onClick={() => navigate(`/edit-contact/${contact.id}`)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Pencil size={16} strokeWidth={2} />
                  <span>Edit Contact</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Trash2 size={16} strokeWidth={2} />
                  <span>Delete Contact</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Contact not found.</p>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ContactDetails;
