import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ContactForm from '../components/ContactForm';
import { contactAPI } from '../services/api';

function AddContact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddContact = async (formData) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await contactAPI.create(formData);
      if (response.success) {
        setSuccessMsg('Contact added successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(response.message || 'Failed to add contact.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving contact. Please try again.');
    } finally {
      setLoading(false);
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>+</span>
                <span>Add New Contact</span>
              </h2>
              <p>Fill in the contact information below</p>
            </div>

            {error && <div className="alert alert-error">?? {error}</div>}
            {successMsg && <div className="alert alert-success">? {successMsg}</div>}

            <ContactForm
              onSubmit={handleAddContact}
              isEditing={false}
              isLoading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddContact;
