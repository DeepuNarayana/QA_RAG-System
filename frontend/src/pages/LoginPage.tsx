/**
 * Login Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layout, Button, Input } from '../components';
import '../styles/auth.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.username || !formData.password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.username, formData.password);
      navigate('/books');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <h1>Login</h1>

          {(error || validationError) && (
            <div className="alert alert-error">
              {error || validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isLoading}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="auth-submit"
            >
              Login
            </Button>
          </form>

          <p className="auth-link">
            Don't have an account?{' '}
            <a href="/register">Sign up here</a>
          </p>
        </div>
      </div>
    </Layout>
  );
};
