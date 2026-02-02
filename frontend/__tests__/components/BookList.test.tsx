import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookList from '../../components/BookList'
import renderWithProviders, { mockData, mockApiCalls } from '../utils/testHelpers'
import * as api from '../../services/api'

// Mock the API module
jest.mock('../../services/api')

describe('BookList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders book list with loading state initially', () => {
    ;(api.fetchBooks as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockData.books), 100))
    )

    renderWithProviders(<BookList />)

    // Check for loading indicator or empty state
    expect(screen.queryByText(/loading|no books/i)).toBeInTheDocument()
  })

  it('displays books after loading', async () => {
    ;(api.fetchBooks as jest.Mock).mockResolvedValue(mockData.books)

    renderWithProviders(<BookList />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument()
      expect(screen.getByText('Book 2')).toBeInTheDocument()
      expect(screen.getByText('Author 1')).toBeInTheDocument()
      expect(screen.getByText('Author 2')).toBeInTheDocument()
    })
  })

  it('displays book ratings', async () => {
    ;(api.fetchBooks as jest.Mock).mockResolvedValue(mockData.books)

    renderWithProviders(<BookList />)

    await waitFor(() => {
      expect(screen.getByText(/4\.5/)).toBeInTheDocument()
      expect(screen.getByText(/4\.0/)).toBeInTheDocument()
    })
  })

  it('handles empty book list', async () => {
    ;(api.fetchBooks as jest.Mock).mockResolvedValue([])

    renderWithProviders(<BookList />)

    await waitFor(() => {
      expect(screen.getByText(/no books found|empty/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(api.fetchBooks as jest.Mock).mockRejectedValue(new Error('API Error'))

    renderWithProviders(<BookList />)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('refetches books on retry', async () => {
    ;(api.fetchBooks as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    ;(api.fetchBooks as jest.Mock).mockResolvedValueOnce(mockData.books)

    renderWithProviders(<BookList />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error|failed|retry/i)).toBeInTheDocument()
    })

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retryButton)

    // Wait for books to appear
    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeInTheDocument()
    })
  })
})
