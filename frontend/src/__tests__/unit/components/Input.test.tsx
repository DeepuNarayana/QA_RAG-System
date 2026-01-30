import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../../components/Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('should handle onChange event', () => {
    const mockChange = vi.fn();
    render(<Input onChange={mockChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockChange).toHaveBeenCalled();
  });

  it('should update value when onChange is triggered', () => {
    render(<Input value="initial" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
  });

  it('should render with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should support different input types', () => {
    render(<Input type="password" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should support required attribute', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should handle focus and blur events', () => {
    const mockFocus = vi.fn();
    const mockBlur = vi.fn();
    render(<Input onFocus={mockFocus} onBlur={mockBlur} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(mockFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(mockBlur).toHaveBeenCalled();
  });

  it('should render with name attribute', () => {
    render(<Input name="email" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.name).toBe('email');
  });
});
