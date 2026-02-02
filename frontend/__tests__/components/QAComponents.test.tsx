import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QAInput from '../../components/QAInput'
import renderWithProviders from '../utils/testHelpers'
import * as api from '../../services/api'

jest.mock('../../services/api')

describe('QAInput Component', () => {
  const mockOnQuestion = jest.fn()

  const defaultProps = {
    onQuestion: mockOnQuestion,
    bookId: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders question input field', () => {
    renderWithProviders(<QAInput {...defaultProps} />)

    expect(screen.getByPlaceholderText(/ask|question|search/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(<QAInput {...defaultProps} />)

    expect(screen.getByRole('button', { name: /ask|submit|send/i })).toBeInTheDocument()
  })

  it('calls onQuestion callback when form is submitted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QAInput {...defaultProps} />)

    const input = screen.getByPlaceholderText(/ask|question|search/i)
    await user.type(input, 'What is this book about?')

    const submitButton = screen.getByRole('button', { name: /ask|submit|send/i })
    await user.click(submitButton)

    expect(mockOnQuestion).toHaveBeenCalledWith('What is this book about?')
  })

  it('clears input after submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QAInput {...defaultProps} />)

    const input = screen.getByPlaceholderText(/ask|question|search/i) as HTMLInputElement
    await user.type(input, 'What is this book about?')

    const submitButton = screen.getByRole('button', { name: /ask|submit|send/i })
    await user.click(submitButton)

    expect(input.value).toBe('')
  })

  it('disables submit button when input is empty', () => {
    renderWithProviders(<QAInput {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /ask|submit|send/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when input has text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QAInput {...defaultProps} />)

    const input = screen.getByPlaceholderText(/ask|question|search/i)
    const submitButton = screen.getByRole('button', { name: /ask|submit|send/i })

    expect(submitButton).toBeDisabled()

    await user.type(input, 'Question?')

    expect(submitButton).toBeEnabled()
  })

  it('shows loading state during submission', async () => {
    let resolvePromise: () => void
    const promise = new Promise<any>((resolve) => {
      resolvePromise = () => resolve({})
    })
    mockOnQuestion.mockReturnValue(promise)

    const user = userEvent.setup()
    renderWithProviders(<QAInput {...defaultProps} />)

    const input = screen.getByPlaceholderText(/ask|question|search/i)
    await user.type(input, 'What is this book about?')

    const submitButton = screen.getByRole('button', { name: /ask|submit|send/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()

    resolvePromise!()
  })
})

/**
 * Tests for QAResults component
 */
import QAResults from '../../components/QAResults'

describe('QAResults Component', () => {
  const mockResponse = {
    question: 'What is this book about?',
    answer: 'This book is about...',
    sources: [
      {
        document_id: 1,
        excerpt: 'Relevant excerpt from the document',
        confidence: 0.95,
      },
    ],
    timestamp: new Date().toISOString(),
  }

  const defaultProps = {
    response: mockResponse,
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders QA response', () => {
    renderWithProviders(<QAResults {...defaultProps} />)

    expect(screen.getByText('What is this book about?')).toBeInTheDocument()
    expect(screen.getByText(/this book is about/i)).toBeInTheDocument()
  })

  it('displays sources with confidence scores', () => {
    renderWithProviders(<QAResults {...defaultProps} />)

    expect(screen.getByText(/sources?|references?/i)).toBeInTheDocument()
    expect(screen.getByText(/95%|0\.95/)).toBeInTheDocument()
  })

  it('displays source excerpts', () => {
    renderWithProviders(<QAResults {...defaultProps} />)

    expect(screen.getByText(/relevant excerpt/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    renderWithProviders(<QAResults {...defaultProps} isLoading={true} />)

    expect(screen.getByText(/loading|generating|thinking/i)).toBeInTheDocument()
  })

  it('handles empty response gracefully', () => {
    renderWithProviders(
      <QAResults response={{ ...mockResponse, sources: [] }} isLoading={false} />
    )

    expect(screen.getByText(/no sources|empty/i)).toBeInTheDocument()
  })

  it('displays response timestamp', () => {
    const timestamp = '2024-01-15T10:00:00Z'
    renderWithProviders(
      <QAResults response={{ ...mockResponse, timestamp }} isLoading={false} />
    )

    expect(screen.getByText(/jan|2024|01/i)).toBeInTheDocument()
  })
})
