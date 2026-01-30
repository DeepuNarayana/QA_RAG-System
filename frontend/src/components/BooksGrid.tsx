import React from 'react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface Props {
  books: Book[];
  onView: (id: number) => void;
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
}

export const BooksGrid: React.FC<Props> = ({ books, onView, onEdit, onDelete }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
