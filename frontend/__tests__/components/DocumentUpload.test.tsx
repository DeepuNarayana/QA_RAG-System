import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentUpload from '../../components/DocumentUpload'
import renderWithProviders from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('DocumentUpload Component', () => {
  const mockOnUploadSuccess = jest.fn()

  const defaultProps = {
    onUploadSuccess: mockOnUploadSuccess,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders upload form', () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    expect(screen.getByText(/upload|document|file/i)).toBeInTheDocument()
  })

  it('displays file input', () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    expect(screen.getByLabelText(/file|choose|select/i)).toBeInTheDocument()
  })

  it('accepts PDF files', async () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    expect(fileInput.accept).toContain('pdf')
  })

  it('uploads file on submit', async () => {
    ;(api.uploadDocument as jest.Mock).mockResolvedValue({
      id: 1,
      filename: 'test.pdf',
      size: 1024,
    })

    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /upload|submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.uploadDocument).toHaveBeenCalled()
    })
  })

  it('calls onUploadSuccess callback after successful upload', async () => {
    ;(api.uploadDocument as jest.Mock).mockResolvedValue({
      id: 1,
      filename: 'test.pdf',
    })

    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /upload|submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalled()
    })
  })

  it('displays success message after upload', async () => {
    ;(api.uploadDocument as jest.Mock).mockResolvedValue({
      id: 1,
      filename: 'test.pdf',
    })

    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /upload|submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/success|uploaded/i)).toBeInTheDocument()
    })
  })

  it('displays error message on upload failure', async () => {
    ;(api.uploadDocument as jest.Mock).mockRejectedValue(new Error('Upload failed'))

    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /upload|submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve({ id: 1, filename: 'test.pdf' })
    })
    ;(api.uploadDocument as jest.Mock).mockReturnValue(promise)

    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /upload|submit/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()

    resolvePromise!()
  })

  it('displays file size information', async () => {
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    expect(screen.getByText(/size|file size/i)).toBeInTheDocument()
  })

  it('validates file size', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentUpload {...defaultProps} />)

    const fileInput = screen.getByLabelText(/file|choose|select/i) as HTMLInputElement
    // Create a large file (larger than typical limit of 10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    })

    await user.upload(fileInput, largeFile)

    await waitFor(() => {
      expect(screen.getByText(/too large|size exceeds/i)).toBeInTheDocument()
    })
  })
})
