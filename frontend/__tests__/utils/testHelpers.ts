import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../context/AuthContext'
import { ErrorProvider } from '../../context/ErrorContext'

/**
 * Custom render function that wraps components with all required providers
 * Matches the provider setup in _app.tsx
 */
export function renderWithProviders(
  ui: ReactNode,
  {
    initialState,
    ...renderOptions
  }: {
    initialState?: any
    [key: string]: any
  } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <AuthProvider>{children}</AuthProvider>
        </ErrorProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock data generators for consistent testing
 */
export const mockData = {
  book: {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    summary: 'A great test book',
    description: 'This is a test book description',
    genre: 'Fiction',
    year_published: 2023,
    pages: 300,
    isbn: '123-456-789',
    average_rating: 4.5,
    review_count: 10,
  },
  books: [
    {
      id: '1',
      title: 'Book 1',
      author: 'Author 1',
      average_rating: 4.5,
      review_count: 5,
    },
    {
      id: '2',
      title: 'Book 2',
      author: 'Author 2',
      average_rating: 4.0,
      review_count: 8,
    },
  ],
  user: {
    id: 1,
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'user' as const,
    created_at: '2024-01-01T00:00:00Z',
  },
  review: {
    id: '1',
    book_id: '1',
    user_id: '1',
    rating: 5,
    review_text: 'Great book!',
    created_at: '2024-01-01T00:00:00Z',
  },
  borrow: {
    id: '1',
    book_id: '1',
    user_id: '1',
    borrowed_date: '2024-01-01T00:00:00Z',
    due_date: '2024-02-01T00:00:00Z',
    returned_date: undefined,
  },
  recommendation: {
    book_id: '2',
    title: 'Recommended Book',
    author: 'Recommended Author',
    reason: 'Based on your reading history',
  },
}

/**
 * Mock API functions for testing
 */
export const mockApiCalls = {
  fetchBooks: jest.fn().mockResolvedValue(mockData.books),
  fetchBook: jest.fn().mockResolvedValue(mockData.book),
  createBook: jest.fn().mockResolvedValue(mockData.book),
  updateBook: jest.fn().mockResolvedValue(mockData.book),
  deleteBook: jest.fn().mockResolvedValue({}),
  fetchAllUsers: jest.fn().mockResolvedValue([mockData.user]),
  fetchUser: jest.fn().mockResolvedValue(mockData.user),
  createReview: jest.fn().mockResolvedValue(mockData.review),
  getBookReviews: jest.fn().mockResolvedValue([mockData.review]),
  borrowBook: jest.fn().mockResolvedValue(mockData.borrow),
  returnBook: jest.fn().mockResolvedValue({ ...mockData.borrow, returned_date: new Date() }),
  getUserBorrows: jest.fn().mockResolvedValue([mockData.borrow]),
  getUserRecommendations: jest.fn().mockResolvedValue([mockData.recommendation]),
  triggerIngestion: jest.fn().mockResolvedValue({}),
  fetchIngestionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
  fetchIngestionLogs: jest.fn().mockResolvedValue([]),
}

export default renderWithProviders
