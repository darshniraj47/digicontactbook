import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, Mail, Eye, Pencil, Trash2 } from 'lucide-react';

function ContactCard({ contact, onToggleFavorite, onDelete }) {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete contact "${contact.name}"?`)) {
      onDelete(contact.id);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(contact.id);
  };

  return (
    <div className="contact-card">
      <div className="contact-card-header">
        <div className="contact-info-wrapper">
          <div className="contact-avatar">
            {getInitials(contact.name)}
          </div>
          <div>
            <h3 className="contact-name">{contact.name}</h3>
            <span className="category-tag">{contact.category || 'Other'}</span>
          </div>
        </div>
        <button 
          onClick={handleFavorite} 
          className={`fav-btn ${contact.is_favorite ? 'active' : ''}`}
          title={contact.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Heart 
            size={22} 
            strokeWidth={2}
            fill={contact.is_favorite ? 'currentColor' : 'none'} 
          />
        </button>
      </div>

      <div className="contact-card-body">
        <div className="contact-detail-row">
          <span className="detail-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Phone size={15} strokeWidth={2} />
          </span>
          <span>{contact.phone}</span>
        </div>
        {contact.email && (
          <div className="contact-detail-row">
            <span className="detail-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Mail size={15} strokeWidth={2} />
            </span>
            <span>{contact.email}</span>
          </div>
        )}
      </div>

      <div className="contact-card-actions">
        <button 
          onClick={() => navigate(`/contact/${contact.id}`)} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Eye size={15} strokeWidth={2} />
          <span>View</span>
        </button>
        <button 
          onClick={() => navigate(`/edit-contact/${contact.id}`)} 
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Pencil size={15} strokeWidth={2} />
          <span>Edit</span>
        </button>
        <button 
          onClick={handleDelete} 
          className="btn btn-danger btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Trash2 size={15} strokeWidth={2} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

export default ContactCard;
