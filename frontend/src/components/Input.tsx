/**
 * Input Component
 */

import React from 'react';
import '../styles/input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className || ''}`} {...props} />
      {error && <span className="input-error-text">{error}</span>}
      {helpText && <span className="input-help-text">{helpText}</span>}
    </div>
  );
};
