import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../../components/Header'
import Button from '../../components/Button'
import ErrorBoundary from '../../components/ErrorBoundary'
import renderWithProviders from '../utils/testHelpers'

describe('Header Component', () => {
  it('renders navigation header', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('displays app logo/title', () => {
    renderWithProviders(<Header />)

    expect(screen.getByText(/lumina|library/i)).toBeInTheDocument()
  })

  it('displays navigation links', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('link', { name: /home|dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /books|browse/i })).toBeInTheDocument()
  })

  it('displays user menu when authenticated', () => {
    renderWithProviders(<Header />)

    expect(screen.getByText(/profile|settings|logout/i)).toBeInTheDocument()
  })

  it('has responsive design', () => {
    const { container } = renderWithProviders(<Header />)

    // Check for mobile menu toggle button
    expect(container.querySelector('[aria-label*="menu"]')).toBeTruthy()
  })
})

describe('Button Component', () => {
  it('renders button with label', () => {
    renderWithProviders(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    renderWithProviders(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('respects disabled prop', () => {
    renderWithProviders(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant styles', () => {
    const { container } = renderWithProviders(
      <Button variant="primary">Primary</Button>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass(/primary|btn-primary/i)
  })

  it('applies size variants', () => {
    const { container } = renderWithProviders(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass(/lg|large|big/i)
  })

  it('shows loading state', () => {
    renderWithProviders(<Button isLoading>Loading</Button>)

    expect(screen.getByText(/loading|spinner/i)).toBeInTheDocument()
  })

  it('displays icon when provided', () => {
    renderWithProviders(
      <Button icon={<span data-testid="icon">🚀</span>}>With Icon</Button>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress error logs during tests
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const ErrorComponent = () => {
    throw new Error('Test error')
  }

  it('catches errors and displays fallback', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong|error|unexpected/i)).toBeInTheDocument()
  })

  it('displays error message', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it('renders children when no error occurs', () => {
    const TestChild = () => <div>No error</div>

    renderWithProviders(
      <ErrorBoundary>
        <TestChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('displays reset button', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /reset|retry|try again/i })).toBeInTheDocument()
  })

  it('resets error boundary on reset button click', async () => {
    const user = userEvent.setup()
    let shouldError = true

    const ConditionalErrorComponent = () => {
      if (shouldError) throw new Error('Test error')
      return <div>Recovered</div>
    }

    const { rerender } = renderWithProviders(
      <ErrorBoundary>
        <ConditionalErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    shouldError = false
    const resetButton = screen.getByRole('button', { name: /reset|retry|try again/i })
    await user.click(resetButton)

    rerender(
      <ErrorBoundary>
        <ConditionalErrorComponent />
      </ErrorBoundary>
    )

    // After reset, should render successfully
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })

  it('provides error context to parent error boundary', () => {
    const mockErrorHandler = jest.fn()

    renderWithProviders(
      <ErrorBoundary onError={mockErrorHandler}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(mockErrorHandler).toHaveBeenCalledWith(expect.any(Error))
  })
})
