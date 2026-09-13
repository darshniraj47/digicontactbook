import React from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Family', 'Friends', 'College', 'Work', 'Other'];

function SearchBar({ searchQuery, onSearchChange, selectedCategory, onCategoryChange }) {
  return (
    <div className="search-filter-section">
      <div className="search-filter-row">
        <div className="search-input-group">
          <span className="search-icon-symbol" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search contacts by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
