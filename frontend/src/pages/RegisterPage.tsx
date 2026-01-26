/**
 * Register Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Layout, Button, Input } from '../components';
import '../styles/auth.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setValidationError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password, formData.fullName);
      // After successful registration, redirect to login
      navigate('/login', {
        state: { message: 'Registration successful. Please login.' },
      });
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <h1>Sign Up</h1>

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
              placeholder="Choose a username"
              disabled={isLoading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />

            <Input
              label="Full Name (Optional)"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              helpText="At least 8 characters, with uppercase and numbers"
              disabled={isLoading}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="auth-submit"
            >
              Sign Up
            </Button>
          </form>

          <p className="auth-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </Layout>
  );
};
