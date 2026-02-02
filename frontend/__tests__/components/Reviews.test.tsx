import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Reviews from '../../components/Reviews'
import renderWithProviders, { mockData, mockApiCalls } from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('Reviews Component', () => {
  const defaultProps = {
    bookId: 1,
    borrowed: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([mockData.review])
  })

  it('renders reviews section', () => {
    renderWithProviders(<Reviews {...defaultProps} />)

    expect(screen.getByText(/reviews?/i)).toBeInTheDocument()
  })

  it('displays book reviews', async () => {
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([mockData.review])

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Great book!')).toBeInTheDocument()
      expect(screen.getByText(/5.*rating|⭐/i)).toBeInTheDocument()
    })
  })

  it('displays multiple reviews', async () => {
    const reviews = [
      mockData.review,
      { ...mockData.review, id: '2', review_text: 'Excellent!' },
      { ...mockData.review, id: '3', review_text: 'Worth reading' },
    ]
    ;(api.getBookReviews as jest.Mock).mockResolvedValue(reviews)

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Great book!')).toBeInTheDocument()
      expect(screen.getByText('Excellent!')).toBeInTheDocument()
      expect(screen.getByText('Worth reading')).toBeInTheDocument()
    })
  })

  it('handles empty reviews gracefully', async () => {
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([])

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/no reviews|empty/i)).toBeInTheDocument()
    })
  })

  it('displays review form when user has borrowed the book', () => {
    renderWithProviders(<Reviews {...defaultProps} borrowed={true} />)

    expect(screen.getByText(/add.*review|write.*review/i)).toBeInTheDocument()
  })

  it('does not show review form when user has not borrowed the book', () => {
    renderWithProviders(<Reviews {...defaultProps} borrowed={false} />)

    expect(screen.queryByText(/add.*review|write.*review/i)).not.toBeInTheDocument()
  })

  it('submits review with rating and text', async () => {
    ;(api.createReview as jest.Mock).mockResolvedValue(mockData.review)
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([mockData.review])

    const user = userEvent.setup()
    renderWithProviders(<Reviews {...defaultProps} borrowed={true} />)

    // Wait for form to be visible
    await waitFor(() => {
      expect(screen.getByText(/add.*review|write.*review/i)).toBeInTheDocument()
    })

    // Fill in the review form
    const ratingInput = screen.getByLabelText(/rating/i)
    const textInput = screen.getByLabelText(/review|comment/i)

    await user.selectOptions(ratingInput, '5')
    await user.type(textInput, 'Great book!')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit|post/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.createReview).toHaveBeenCalledWith(
        expect.objectContaining({
          book_id: defaultProps.bookId,
          rating: 5,
          review_text: 'Great book!',
        })
      )
    })
  })

  it('displays loading state when fetching reviews', () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve([mockData.review])
    })
    ;(api.getBookReviews as jest.Mock).mockReturnValue(promise)

    renderWithProviders(<Reviews {...defaultProps} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolvePromise!()
  })

  it('handles API errors gracefully', async () => {
    ;(api.getBookReviews as jest.Mock).mockRejectedValue(new Error('Failed to fetch reviews'))

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('displays user who left the review', async () => {
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([
      { ...mockData.review, user_name: 'John Doe' },
    ])

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })
  })

  it('displays review creation date', async () => {
    const reviewDate = '2024-01-15T10:00:00Z'
    ;(api.getBookReviews as jest.Mock).mockResolvedValue([
      { ...mockData.review, created_at: reviewDate },
    ])

    renderWithProviders(<Reviews {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/jan|2024|01/i)).toBeInTheDocument()
    })
  })
})
