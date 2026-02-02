import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BorrowReturn from '../../components/BorrowReturn'
import renderWithProviders, { mockData, mockApiCalls } from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('BorrowReturn Component', () => {
  const defaultProps = {
    bookId: 1,
    userId: 1,
    borrowed: false,
    onBorrowSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders borrow button when not borrowed', () => {
    renderWithProviders(<BorrowReturn {...defaultProps} />)

    expect(screen.getByRole('button', { name: /borrow/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /return/i })).not.toBeInTheDocument()
  })

  it('renders return button when already borrowed', () => {
    renderWithProviders(<BorrowReturn {...defaultProps} borrowed={true} />)

    expect(screen.getByRole('button', { name: /return/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /borrow/i })).not.toBeInTheDocument()
  })

  it('calls borrowBook API when borrow button is clicked', async () => {
    ;(api.borrowBook as jest.Mock).mockResolvedValue(mockData.borrow)

    const user = userEvent.setup()
    renderWithProviders(<BorrowReturn {...defaultProps} />)

    const borrowButton = screen.getByRole('button', { name: /borrow/i })
    await user.click(borrowButton)

    await waitFor(() => {
      expect(api.borrowBook).toHaveBeenCalledWith(defaultProps.bookId, defaultProps.userId)
    })
  })

  it('calls returnBook API when return button is clicked', async () => {
    ;(api.returnBook as jest.Mock).mockResolvedValue({
      ...mockData.borrow,
      returned_date: new Date(),
    })

    const user = userEvent.setup()
    renderWithProviders(<BorrowReturn {...defaultProps} borrowed={true} />)

    const returnButton = screen.getByRole('button', { name: /return/i })
    await user.click(returnButton)

    await waitFor(() => {
      expect(api.returnBook).toHaveBeenCalledWith(defaultProps.bookId, defaultProps.userId)
    })
  })

  it('calls onBorrowSuccess callback after successful borrow', async () => {
    ;(api.borrowBook as jest.Mock).mockResolvedValue(mockData.borrow)

    const onBorrowSuccess = jest.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <BorrowReturn {...defaultProps} onBorrowSuccess={onBorrowSuccess} />
    )

    const borrowButton = screen.getByRole('button', { name: /borrow/i })
    await user.click(borrowButton)

    await waitFor(() => {
      expect(onBorrowSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on API failure', async () => {
    ;(api.borrowBook as jest.Mock).mockRejectedValue(new Error('Borrow failed'))

    const user = userEvent.setup()
    renderWithProviders(<BorrowReturn {...defaultProps} />)

    const borrowButton = screen.getByRole('button', { name: /borrow/i })
    await user.click(borrowButton)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during API call', async () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve(mockData.borrow)
    })
    ;(api.borrowBook as jest.Mock).mockReturnValue(promise)

    const user = userEvent.setup()
    renderWithProviders(<BorrowReturn {...defaultProps} />)

    const borrowButton = screen.getByRole('button', { name: /borrow/i })
    await user.click(borrowButton)

    await waitFor(() => {
      expect(borrowButton).toBeDisabled()
    })

    resolvePromise!()
  })

  it('disables button when already processing', async () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve(mockData.borrow)
    })
    ;(api.borrowBook as jest.Mock).mockReturnValue(promise)

    const user = userEvent.setup()
    const { rerender } = renderWithProviders(<BorrowReturn {...defaultProps} />)

    const borrowButton = screen.getByRole('button', { name: /borrow/i })
    await user.click(borrowButton)

    // Button should be disabled during the request
    expect(borrowButton).toBeDisabled()

    resolvePromise!()
  })
})
