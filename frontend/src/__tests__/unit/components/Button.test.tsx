import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../components/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const mockClick = vi.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should not call onClick when disabled', () => {
    const mockClick = vi.fn();
    render(
      <Button disabled onClick={mockClick}>
        Click me
      </Button>
    );
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('should have correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit') as HTMLButtonElement;
    expect(button.type).toBe('submit');
  });

  it('should apply variant class', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('btn-primary');
  });

  it('should apply size class', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large');
    expect(button).toHaveClass('btn-lg');
  });

  it('should support children elements', () => {
    render(
      <Button>
        <span>Icon</span>
        Text
      </Button>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<Button isLoading>Loading...</Button>);
    const button = screen.getByText('Loading...') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });
});
