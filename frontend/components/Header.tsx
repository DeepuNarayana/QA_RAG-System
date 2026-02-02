import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">Lumina Library</h1>
            </Link>

            {isAuthenticated && !isLoading && (
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Books
                </Link>
                <Link
                  href="/documents"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Documents
                </Link>
                <Link
                  href="/ingestion"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Ingestion
                </Link>
                <Link
                  href="/qa"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Q&A
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/users"
                    className="text-gray-700 hover:text-blue-600 transition font-medium"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.full_name?.[0] || user?.email?.[0] || '?'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user?.full_name || user?.email}
                  </span>
                  <span className="text-gray-600">▼</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-semibold">
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>

                    {user?.role === 'admin' && (
                      <>
                        <Link
                          href="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Manage Users
                        </Link>
                        <div className="border-t border-gray-100"></div>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
