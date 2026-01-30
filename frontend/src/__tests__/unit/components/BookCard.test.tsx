import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from '../../../components/BookCard';
import { Book } from '../../../types';

const mockBook: Book = {
  id: 1,
  owner_id: 1,
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  year_published: 2023,
  description: 'This is a test book description',
  summary: 'Summary',
  isbn: '123456789',
  pages: 300,
  average_rating: 4.5,
  created_at: '2023-01-01',
  updated_at: '2023-01-01'
};

describe('BookCard Component', () => {
  it('should render book title', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  it('should render book author', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('by Test Author')).toBeInTheDocument();
  });

  it('should render book rating', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
  });

  it('should render book genre', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('Fiction')).toBeInTheDocument();
  });

  it('should render truncated description', () => {
    render(<BookCard book={mockBook} />);
    const description = screen.getByText(/This is a test book description/);
    expect(description).toBeInTheDocument();
  });

  it('should render View button when onView is provided', () => {
    const mockOnView = vi.fn();
    render(<BookCard book={mockBook} onView={mockOnView} />);
    const viewButton = screen.getByText('View');
    expect(viewButton).toBeInTheDocument();
  });

  it('should call onView when View button is clicked', () => {
    const mockOnView = vi.fn();
    render(<BookCard book={mockBook} onView={mockOnView} />);
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);
    expect(mockOnView).toHaveBeenCalledWith(mockBook.id);
  });

  it('should render Edit button when onEdit is provided', () => {
    const mockOnEdit = vi.fn();
    render(<BookCard book={mockBook} onEdit={mockOnEdit} />);
    const editButton = screen.getByText('Edit');
    expect(editButton).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    const mockOnEdit = vi.fn();
    render(<BookCard book={mockBook} onEdit={mockOnEdit} />);
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockBook);
  });

  it('should render Delete button when onDelete is provided', () => {
    const mockOnDelete = vi.fn();
    render(<BookCard book={mockBook} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when Delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(<BookCard book={mockBook} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockBook.id);
  });

  it('should not render buttons when handlers are not provided', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.queryByText('View')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should render book without optional fields', () => {
    const bookWithoutOptionals: Book = {
      id: 2,
      owner_id: 1,
      title: 'Minimal Book',
      author: 'Author Name',
      average_rating: 3.0,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };
    render(<BookCard book={bookWithoutOptionals} />);
    expect(screen.getByText('Minimal Book')).toBeInTheDocument();
    expect(screen.getByText('by Author Name')).toBeInTheDocument();
  });
});
