import { screen } from '@testing-library/react'
import ProtectedRoute from '../../components/ProtectedRoute'
import renderWithProviders from '../utils/testHelpers'
import * as AuthContext from '../../context/AuthContext'

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn(),
}))

describe('ProtectedRoute Component', () => {
  const TestContent = () => <div>Protected Content</div>
  const UnauthorizedContent = () => <div>Unauthorized Access</div>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, email: 'test@example.com', role: 'user' },
      isLoading: false,
    })

    renderWithProviders(
      <ProtectedRoute requiredRole="user">
        <TestContent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when user has required role', () => {
    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
      isLoading: false,
    })

    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    })

    renderWithProviders(
      <ProtectedRoute requiredRole="user">
        <TestContent />
      </ProtectedRoute>
    )

    expect(screen.getByText(/loading|checking/i)).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const mockUseRouter = jest.fn()
    jest.mock('next/router', () => ({
      useRouter: mockUseRouter,
    }))

    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    })

    renderWithProviders(
      <ProtectedRoute requiredRole="user">
        <TestContent />
      </ProtectedRoute>
    )

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('denies access when user role does not match required role', () => {
    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, email: 'user@example.com', role: 'user' },
      isLoading: false,
    })

    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestContent />
      </ProtectedRoute>
    )

    expect(screen.getByText(/unauthorized|access denied|permission/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('allows access when no specific role is required', () => {
    ;(AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, email: 'test@example.com', role: 'user' },
      isLoading: false,
    })

    renderWithProviders(<ProtectedRoute>{<TestContent />}</ProtectedRoute>)

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
