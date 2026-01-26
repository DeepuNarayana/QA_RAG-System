/**
 * Book Store (Zustand)
 */

import { create } from 'zustand';
import { Book, Review } from '../types';
import { bookService } from '../services';

interface BookStore {
  books: Book[];
  currentBook: Book | null;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;

  // Book Actions
  fetchBooks: (skip?: number, limit?: number) => Promise<void>;
  fetchBook: (id: number) => Promise<void>;
  createBook: (bookData: Partial<Book>) => Promise<void>;
  updateBook: (id: number, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;

  // Review Actions
  fetchReviews: (bookId: number) => Promise<void>;
  addReview: (bookId: number, rating: number, text?: string) => Promise<void>;
  deleteReview: (bookId: number, reviewId: number) => Promise<void>;

  clearError: () => void;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  currentBook: null,
  reviews: [],
  isLoading: false,
  error: null,

  fetchBooks: async (skip = 0, limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const books = await bookService.getBooks(skip, limit);
      set({ books, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  fetchBook: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const book = await bookService.getBook(id);
      set({ currentBook: book, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  createBook: async (bookData: Partial<Book>) => {
    set({ isLoading: true, error: null });
    try {
      const newBook = await bookService.createBook(bookData);
      set((state) => ({
        books: [newBook, ...state.books],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateBook: async (id: number, bookData: Partial<Book>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await bookService.updateBook(id, bookData);
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updated : b)),
        currentBook: state.currentBook?.id === id ? updated : state.currentBook,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBook: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await bookService.deleteBook(id);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchReviews: async (bookId: number) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await bookService.getReviews(bookId);
      set({ reviews, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  addReview: async (bookId: number, rating: number, text?: string) => {
    set({ isLoading: true, error: null });
    try {
      const review = await bookService.addReview(bookId, rating, text);
      set((state) => ({
        reviews: [review, ...state.reviews],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteReview: async (bookId: number, reviewId: number) => {
    set({ isLoading: true, error: null });
    try {
      await bookService.deleteReview(bookId, reviewId);
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== reviewId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
