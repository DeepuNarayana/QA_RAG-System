import { useEffect, useState, useCallback } from 'react';
import { Book } from '../types';
import { bookService } from '../services';

export function useBooks(initial: Book[] = []) {
  const [books, setBooks] = useState<Book[]>(initial);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (skip = 0, limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookService.getBooks(skip, limit);
      setBooks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await bookService.deleteBook(id);
      setBooks((s) => s.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete book');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initial.length === 0) fetch();
  }, [fetch, initial]);

  return { books, loading, error, fetchBooks: fetch, deleteBook: remove } as const;
}
