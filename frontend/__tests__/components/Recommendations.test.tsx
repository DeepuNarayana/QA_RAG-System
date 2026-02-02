import { screen, waitFor } from '@testing-library/react'
import Recommendations from '../../components/Recommendations'
import renderWithProviders, { mockData } from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('Recommendations Component', () => {
  const defaultProps = {
    userId: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders recommendations section', () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([])

    renderWithProviders(<Recommendations {...defaultProps} />)

    expect(screen.getByText(/recommendations?|suggested|for you/i)).toBeInTheDocument()
  })

  it('displays recommended books', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([
      mockData.recommendation,
      { ...mockData.recommendation, book_id: '3', title: 'Another Recommendation' },
    ])

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Recommended Book')).toBeInTheDocument()
      expect(screen.getByText('Another Recommendation')).toBeInTheDocument()
    })
  })

  it('displays recommendation reason', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([mockData.recommendation])

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/based on|reason|reading history/i)).toBeInTheDocument()
    })
  })

  it('handles empty recommendations', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([])

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/no recommendations|empty/i)).toBeInTheDocument()
    })
  })

  it('fetches recommendations on mount', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([mockData.recommendation])

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(api.getUserRecommendations).toHaveBeenCalledWith(defaultProps.userId)
    })
  })

  it('displays loading state initially', () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve([mockData.recommendation])
    })
    ;(api.getUserRecommendations as jest.Mock).mockReturnValue(promise)

    renderWithProviders(<Recommendations {...defaultProps} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolvePromise!()
  })

  it('handles API errors gracefully', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch recommendations')
    )

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('displays author of recommended books', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([mockData.recommendation])

    renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Recommended Author')).toBeInTheDocument()
    })
  })

  it('updates recommendations when userId changes', async () => {
    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([mockData.recommendation])

    const { rerender } = renderWithProviders(<Recommendations {...defaultProps} />)

    await waitFor(() => {
      expect(api.getUserRecommendations).toHaveBeenCalledWith(defaultProps.userId)
    })

    ;(api.getUserRecommendations as jest.Mock).mockResolvedValue([
      { ...mockData.recommendation, book_id: '4' },
    ])

    rerender(<Recommendations userId={2} />)

    await waitFor(() => {
      expect(api.getUserRecommendations).toHaveBeenCalledWith(2)
    })
  })
})
