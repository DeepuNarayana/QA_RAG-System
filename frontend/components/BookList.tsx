'use client';

import Link from 'next/link';
import BookCard, { Book } from './BookCard';
import useBooks from '../services/hooks/useBooks';
import { useError } from '@/context/ErrorContext';
import { useEffect } from 'react';

export default function BookList() {
  const { data: books, isLoading, error } = useBooks();
  const { addError } = useError();

  useEffect(() => {
    if (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to load books',
        type: 'error',
        duration: 5000,
      });
    }
  }, [error, addError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {books && books.length > 0 ? (
        books.map((b: Book) => (
          <Link key={b.id} href={`/books/${b.id}?userId=1`}>
            <a className="hover:shadow-lg transition transform hover:-translate-y-1">
              <BookCard book={b} />
            </a>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No books available.</p>
        </div>
      )}
    </section>
  );
}
