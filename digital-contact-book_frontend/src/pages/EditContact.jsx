import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ContactForm from '../components/ContactForm';
import { contactAPI } from '../services/api';

function EditContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await contactAPI.getById(id);
        if (response.success && response.contact) {
          setContact(response.contact);
        } else {
          setError(response.message || 'Contact not found');
        }
      } catch (err) {
        setError('Failed to fetch contact details.');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleUpdateContact = async (formData) => {
    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await contactAPI.update(id, formData);
      if (response.success) {
        setSuccessMsg('Contact updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(response.message || 'Failed to update contact.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating contact.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-container">
          <div className="form-page-card">
            <div className="form-page-header">
              <h2>? Edit Contact</h2>
              <p>Update contact information</p>
            </div>

            {error && <div className="alert alert-error">?? {error}</div>}
            {successMsg && <div className="alert alert-success">? {successMsg}</div>}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-text)' }}>
                Loading contact details...
              </div>
            ) : contact ? (
              <ContactForm
                initialData={contact}
                onSubmit={handleUpdateContact}
                isEditing={true}
                isLoading={updating}
              />
            ) : (
              <div className="empty-state">
                <p>Contact could not be loaded.</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditContact;
