/**
 * Book Service
 */

import { Book, Review } from '../types';
import api from './api';

export const bookService = {
  /**
   * Get all books
   */
  async getBooks(skip: number = 0, limit: number = 100): Promise<Book[]> {
    try {
      const response = await api.get<Book[]>('/books', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch books');
    }
  },

  /**
   * Get book by ID
   */
  async getBook(id: number): Promise<Book> {
    try {
      const response = await api.get<Book>(`/books/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch book');
    }
  },

  /**
   * Create book
   */
  async createBook(bookData: Partial<Book>): Promise<Book> {
    try {
      const response = await api.post<Book>('/books', bookData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create book');
    }
  },

  /**
   * Update book
   */
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    try {
      const response = await api.put<Book>(`/books/${id}`, bookData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update book');
    }
  },

  /**
   * Delete book
   */
  async deleteBook(id: number): Promise<void> {
    try {
      await api.delete(`/books/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete book');
    }
  },

  /**
   * Get book summary
   */
  async getBookSummary(
    id: number
  ): Promise<{ summary: string; average_rating: number }> {
    try {
      const response = await api.get(`/books/${id}/summary`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch summary');
    }
  },

  /**
   * Add review
   */
  async addReview(
    bookId: number,
    rating: number,
    reviewText?: string
  ): Promise<Review> {
    try {
      const response = await api.post<Review>(
        `/books/${bookId}/reviews`,
        {
          rating,
          review_text: reviewText,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to add review');
    }
  },

  /**
   * Get book reviews
   */
  async getReviews(bookId: number, skip: number = 0, limit: number = 100): Promise<Review[]> {
    try {
      const response = await api.get<Review[]>(`/books/${bookId}/reviews`, {
        params: { skip, limit },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch reviews');
    }
  },

  /**
   * Delete review
   */
  async deleteReview(bookId: number, reviewId: number): Promise<void> {
    try {
      await api.delete(`/books/${bookId}/reviews/${reviewId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete review');
    }
  },
};
