/**
 * Button Component
 */

import React from 'react';
import classNames from 'classnames';
import '../styles/button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  size = 'medium',
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={classNames(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'btn-loading': loading, 'btn-disabled': disabled },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
};
