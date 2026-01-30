import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '../../hooks/useAsync';
import { Book } from '../../types';

describe('Book Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle fetching books list', async () => {
    const mockBooks: Book[] = [
      {
        id: 1,
        owner_id: 1,
        title: 'Book 1',
        author: 'Author 1',
        average_rating: 4.5,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      },
      {
        id: 2,
        owner_id: 1,
        title: 'Book 2',
        author: 'Author 2',
        average_rating: 3.8,
        created_at: '2023-01-02',
        updated_at: '2023-01-02'
      }
    ];

    const fetchBooks = vi.fn(() => Promise.resolve(mockBooks));
    const { result } = renderHook(() => useAsync(fetchBooks));

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.data).toEqual(mockBooks);
    expect(result.current.loading).toBe(false);
  });

  it('should handle book creation flow', async () => {
    const newBook: Book = {
      id: 3,
      owner_id: 1,
      title: 'New Book',
      author: 'New Author',
      genre: 'Fiction',
      average_rating: 0,
      created_at: '2023-01-03',
      updated_at: '2023-01-03'
    };

    const createBook = vi.fn(() => Promise.resolve(newBook));
    const { result } = renderHook(() => useAsync(createBook, false));

    await act(async () => {
      const createdBook = await result.current.execute();
      expect(createdBook).toEqual(newBook);
    });

    expect(result.current.data).toEqual(newBook);
  });

  it('should handle book update flow', async () => {
    const updatedBook: Book = {
      id: 1,
      owner_id: 1,
      title: 'Updated Book',
      author: 'Author 1',
      average_rating: 4.7,
      created_at: '2023-01-01',
      updated_at: '2023-01-05'
    };

    const updateBook = vi.fn(() => Promise.resolve(updatedBook));
    const { result } = renderHook(() => useAsync(updateBook, false));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data?.title).toBe('Updated Book');
  });

  it('should handle book deletion flow', async () => {
    const deleteBook = vi.fn(() => Promise.resolve({ success: true }));
    const { result } = renderHook(() => useAsync(deleteBook, false));

    await act(async () => {
      await result.current.execute();
    });

    expect(deleteBook).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should handle loading multiple books with error recovery', async () => {
    let attempt = 0;
    const fetchBooks = vi.fn(() => {
      attempt++;
      if (attempt === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve([
        {
          id: 1,
          owner_id: 1,
          title: 'Book 1',
          author: 'Author 1',
          average_rating: 4.5,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ]);
    });

    const { result } = renderHook(() => useAsync(fetchBooks, false));

    // First attempt fails
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Error expected
      }
    });

    expect(result.current.error).not.toBeNull();

    // Second attempt succeeds
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.error).toBeNull();
  });
});
