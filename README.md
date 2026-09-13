# ?? Digital Contact Book App

A clean, modern, and full-stack **Digital Contact Management System** built with **React.js**, **Python Flask**, and **MySQL**, styled with a minimal **Sage + White** color palette.

---

## ?? Key Features

- **?? User Authentication**: Secure user registration and login with encrypted password hashing (Werkzeug).
- **?? Contact CRUD**: Add, view, edit, and delete contacts with field validation.
- **?? Instant Search & Filter**: Real-time multi-field search across names, phone numbers, and emails with category filtering.
- **? Favorites System**: One-click heart toggle to mark important contacts and access them on a dedicated Favorites view.
- **?? Functional Settings**:
  - Update profile name and email address.
  - Securely change passwords.
  - Set default contact categories (`Family`, `Friends`, `College`, `Work`, `Other`).
  - Toggle contact reminder notifications.
  - Export contacts to CSV format.
  - Danger zone with account deletion.
- **?? Responsive Sage + White Theme**: Clean, minimal, mobile-friendly interface styled with Lucide React icons.
- **??? Data Isolation**: All contacts and preferences are strictly isolated per logged-in user.

---

## ??? Technology Stack

- **Frontend**: React.js 18, React Router v6, Axios, Lucide React, Vite, Modern CSS.
- **Backend**: Python 3, Flask, Flask-CORS, mysql-connector-python, python-dotenv.
- **Database**: MySQL (with automatic schema initialization & seamless fallback).

---

## ?? Project Architecture

```
fsd mini pro/
+-- digital-contact-book_frontend/   # React Single Page Application (SPA)
¦   +-- public/
¦   +-- src/
¦   ¦   +-- components/              # Navbar, Sidebar, ContactCard, Form, SearchBar
¦   ¦   +-- pages/                   # Login, Register, Dashboard, Add, Edit, Details, Favorites, Settings
¦   ¦   +-- services/                # Axios API configuration (api.js)
¦   ¦   +-- App.jsx                  # React Router configuration
¦   ¦   +-- main.jsx                 # Entry point
¦   ¦   +-- index.css                # Sage + White design system
¦   +-- package.json
¦   +-- vite.config.js
¦
+-- digital-contact-book_backend/    # Flask REST API Server
    +-- app.py                       # Application entry point & CORS
    +-- database.py                  # Database connection manager
    +-- database.sql                 # SQL schema & DDL scripts
    +-- requirements.txt             # Python dependencies
    +-- .env.example                 # Sample environment variables
    +-- models/                      # User and Contact SQL models
    +-- routes/                      # Auth, Contact, and Profile/Settings REST APIs
```

---

## ?? Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.8+](https://www.python.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) or XAMPP (Optional, local database fallback included)

---

### 2. Backend Setup (Flask)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd digital-contact-book_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Configure MySQL credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=digital_contact_book
   DB_PORT=3306
   ```
5. Run the server:
   ```bash
   python app.py
   ```
   > Server running at: **`http://localhost:5000`**

---

### 3. Frontend Setup (React)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd digital-contact-book_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > Client running at: **`http://localhost:5173`**

---

## ?? API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Register a new user |
| `POST` | `/api/login` | Log in existing user |
| `GET` | `/api/contacts` | Get user contacts (supports `search`, `category`, `favorites_only`) |
| `POST` | `/api/contacts` | Create a new contact |
| `GET` | `/api/contacts/<id>` | Get specific contact details |
| `PUT` | `/api/contacts/<id>` | Update contact |
| `DELETE`| `/api/contacts/<id>` | Delete contact |
| `PUT` | `/api/contacts/<id>/favorite` | Toggle favorite status |
| `GET` | `/api/contacts/export` | Export contacts to CSV |
| `GET` | `/api/profile` | Get user profile info |
| `PUT` | `/api/profile` | Update user name & email |
| `PUT` | `/api/profile/password` | Change user password |
| `GET` | `/api/preferences` | Get contact preferences |
| `PUT` | `/api/preferences` | Update contact preferences |
| `DELETE`| `/api/account` | Permanently delete account & contacts |

---

## ?? License
This project is open-source and available for educational and personal use.
