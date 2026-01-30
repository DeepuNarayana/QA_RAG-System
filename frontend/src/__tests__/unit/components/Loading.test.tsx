import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from '../../../components/Loading';

describe('Loading Component', () => {
  it('should render loading indicator', () => {
    render(<Loading />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Loading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render with default message when not provided', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Loading className="custom-loader" />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveClass('custom-loader');
  });

  it('should render fullscreen variant', () => {
    render(<Loading fullscreen />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveClass('loading-fullscreen');
  });

  it('should have aria-busy attribute', () => {
    render(<Loading />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });
});
