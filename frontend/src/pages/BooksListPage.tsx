/**
 * Books List Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Loading } from '../components';
import '../styles/books-list.css';
import { useBooks } from '../hooks/useBooks';
import { BooksGrid } from '../components/BooksGrid';

export const BooksListPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, loading: isLoading, error, fetchBooks, deleteBook } = useBooks();
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  // fetchBooks is called by the hook on mount; expose manual refresh if needed

  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);

  if (isLoading) return <Layout><Loading message="Loading books..." /></Layout>;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Books</h1>
          <Button onClick={() => navigate('/books/new')} variant="primary">
            + Add New Book
          </Button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {books.length === 0 ? (
          <div className="empty-state">
            <p>No books found. Add your first book!</p>
            <Button onClick={() => navigate('/books/new')} variant="primary">
              Add Book
            </Button>
          </div>
        ) : (
          <>
            <BooksGrid
              books={paginatedBooks}
              onView={(id) => navigate(`/books/${id}`)}
              onEdit={(book) => navigate(`/books/${book.id}/edit`)}
              onDelete={deleteBook}
            />

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
