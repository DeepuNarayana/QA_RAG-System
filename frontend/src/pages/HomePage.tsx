/**
 * Home Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layout, Button } from '../components';
import '../styles/pages.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="page-container">
        <section className="hero">
          <h1>Welcome to Intelligent Book Management</h1>
          <p>Discover, manage, and review books powered by AI</p>

          {user ? (
            <div className="hero-actions">
              <Button onClick={() => navigate('/books')} variant="primary">
                Browse Books
              </Button>
              <Button onClick={() => navigate('/books/new')} variant="secondary">
                Add New Book
              </Button>
            </div>
          ) : (
            <div className="hero-actions">
              <Button onClick={() => navigate('/login')} variant="primary">
                Login
              </Button>
              <Button onClick={() => navigate('/register')} variant="secondary">
                Sign Up
              </Button>
            </div>
          )}
        </section>

        <section className="features">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📚 Book Management</h3>
              <p>Add, edit, and manage your book collection</p>
            </div>
            <div className="feature-card">
              <h3>⭐ Reviews & Ratings</h3>
              <p>Share your thoughts and see what others think</p>
            </div>
            <div className="feature-card">
              <h3>🤖 AI-Powered</h3>
              <p>Get summaries and recommendations using Llama3</p>
            </div>
            <div className="feature-card">
              <h3>❓ Q&A Interface</h3>
              <p>Ask questions and get answers using RAG</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
