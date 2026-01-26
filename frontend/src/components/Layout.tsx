/**
 * Layout Component
 */

import React from 'react';
import { useAuthStore } from '../store';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-brand">📚 Book Management</h1>
          <ul className="navbar-menu">
            <li><a href="/">Home</a></li>
            <li><a href="/books">Books</a></li>
            {user?.role === 'admin' && (
              <li><a href="/admin">Admin</a></li>
            )}
            {user ? (
              <>
                <li className="user-info">{user.username}</li>
                <li>
                  <button onClick={logout} className="btn-logout">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>&copy; 2024 Intelligent Book Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};
