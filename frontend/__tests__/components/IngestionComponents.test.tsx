import { screen, waitFor } from '@testing-library/react'
import IngestionLogs from '../../components/IngestionLogs'
import IngestionStatus from '../../components/IngestionStatus'
import renderWithProviders from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('IngestionLogs Component', () => {
  const mockLogs = [
    {
      id: 1,
      document_id: 1,
      timestamp: '2024-01-15T10:00:00Z',
      step: 'parsing',
      message: 'Started parsing document',
      status: 'info' as const,
    },
    {
      id: 2,
      document_id: 1,
      timestamp: '2024-01-15T10:01:00Z',
      step: 'indexing',
      message: 'Indexing document content',
      status: 'success' as const,
    },
  ]

  const defaultProps = {
    documentId: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.fetchIngestionLogs as jest.Mock).mockResolvedValue(mockLogs)
  })

  it('renders ingestion logs', () => {
    renderWithProviders(<IngestionLogs {...defaultProps} />)

    expect(screen.getByText(/logs?|progress|history/i)).toBeInTheDocument()
  })

  it('displays ingestion log entries', async () => {
    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/started parsing/i)).toBeInTheDocument()
      expect(screen.getByText(/indexing/i)).toBeInTheDocument()
    })
  })

  it('displays log status indicators', async () => {
    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/info|success|error|warning/i)).toBeInTheDocument()
    })
  })

  it('displays log timestamps', async () => {
    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/10:00|10:01/)).toBeInTheDocument()
    })
  })

  it('fetches logs on mount', async () => {
    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(api.fetchIngestionLogs).toHaveBeenCalledWith(defaultProps.documentId)
    })
  })

  it('handles empty logs', async () => {
    ;(api.fetchIngestionLogs as jest.Mock).mockResolvedValue([])

    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/no logs|empty/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(api.fetchIngestionLogs as jest.Mock).mockRejectedValue(new Error('Failed to fetch logs'))

    renderWithProviders(<IngestionLogs {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('auto-refreshes logs', async () => {
    ;(api.fetchIngestionLogs as jest.Mock).mockResolvedValue(mockLogs)

    renderWithProviders(<IngestionLogs {...defaultProps} />)

    // Initial fetch
    await waitFor(() => {
      expect(api.fetchIngestionLogs).toHaveBeenCalledTimes(1)
    })

    // Wait for auto-refresh (typically 5 seconds)
    await waitFor(
      () => {
        expect(api.fetchIngestionLogs).toHaveBeenCalledTimes(2)
      },
      { timeout: 10000 }
    )
  })
})

describe('IngestionStatus Component', () => {
  const mockStatus = {
    status: 'processing' as const,
    progress: 65,
    current_step: 'Extracting text from document',
    start_time: '2024-01-15T10:00:00Z',
    error_message: undefined,
  }

  const defaultProps = {
    documentId: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders ingestion status', () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    expect(screen.getByText(/status|progress/i)).toBeInTheDocument()
  })

  it('displays processing status', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/processing|in progress/i)).toBeInTheDocument()
    })
  })

  it('displays progress bar', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/65%|progress/i)).toBeInTheDocument()
    })
  })

  it('displays current step', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/extracting text/i)).toBeInTheDocument()
    })
  })

  it('displays completed status', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue({
      ...mockStatus,
      status: 'completed',
      progress: 100,
    })

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/completed|done/i)).toBeInTheDocument()
      expect(screen.getByText(/100%/)).toBeInTheDocument()
    })
  })

  it('displays error status', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue({
      ...mockStatus,
      status: 'failed',
      error_message: 'Failed to parse PDF',
    })

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/failed|error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to parse/i)).toBeInTheDocument()
    })
  })

  it('fetches status on mount', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(api.fetchIngestionStatus).toHaveBeenCalledWith(defaultProps.documentId)
    })
  })

  it('auto-refreshes status while processing', async () => {
    ;(api.fetchIngestionStatus as jest.Mock).mockResolvedValue(mockStatus)

    renderWithProviders(<IngestionStatus {...defaultProps} />)

    // Initial fetch
    await waitFor(() => {
      expect(api.fetchIngestionStatus).toHaveBeenCalledTimes(1)
    })

    // Auto-refresh while processing
    await waitFor(
      () => {
        expect(api.fetchIngestionStatus).toHaveBeenCalledTimes(2)
      },
      { timeout: 10000 }
    )
  })

  it('stops refreshing when status is completed', async () => {
    ;(api.fetchIngestionStatus as jest.Mock)
      .mockResolvedValueOnce(mockStatus)
      .mockResolvedValueOnce({
        ...mockStatus,
        status: 'completed',
        progress: 100,
      })

    const { rerender } = renderWithProviders(<IngestionStatus {...defaultProps} />)

    await waitFor(() => {
      expect(api.fetchIngestionStatus).toHaveBeenCalledTimes(2)
    })

    // Wait to ensure no additional calls
    await new Promise((resolve) => setTimeout(resolve, 2000))
    expect(api.fetchIngestionStatus).toHaveBeenCalledTimes(2)
  })
})
