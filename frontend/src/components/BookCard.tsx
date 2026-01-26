/**
 * BookCard Component
 */

import React from 'react';
import { Book } from '../types';
import '../styles/card.css';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title">{book.title}</h3>
        <span className="book-rating">⭐ {book.average_rating.toFixed(1)}</span>
      </div>

      <p className="book-author">by {book.author}</p>

      {book.genre && <p className="book-genre">{book.genre}</p>}

      {book.description && (
        <p className="book-description">{book.description.substring(0, 100)}...</p>
      )}

      <div className="book-card-footer">
        {onView && (
          <button className="btn-link" onClick={() => onView(book.id)}>
            View
          </button>
        )}
        {onEdit && (
          <button className="btn-link" onClick={() => onEdit(book)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn-link btn-danger" onClick={() => onDelete(book.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
