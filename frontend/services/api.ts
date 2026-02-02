import axios, { AxiosError } from 'axios';

export type Book = {
  id: string;
  title: string;
  author?: string;
  summary?: string;
  description?: string;
  genre?: string;
  year_published?: number;
  pages?: number;
  isbn?: string;
  average_rating?: number;
  review_count?: number;
};

export type Review = {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export type Borrow = {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_date: string;
  due_date: string;
  returned_date?: string;
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  user: User;
  token_type: string;
};

export type Document = {
  id: number;
  book_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  ingestion_status: 'pending' | 'processing' | 'completed' | 'failed';
  ingestion_progress?: number;
  error_message?: string;
};

export type IngestionStatus = {
  id: number;
  document_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  start_time?: string;
  end_time?: string;
  error_message?: string;
};

export type IngestionLog = {
  id: number;
  document_id: number;
  timestamp: string;
  step: string;
  message: string;
  status: 'info' | 'warning' | 'error' | 'success';
};

export type QAResponse = {
  id?: number;
  question: string;
  answer: string;
  sources: Array<{
    document_id: number;
    excerpt: string;
    confidence: number;
  }>;
  timestamp?: string;
};

export type QAConversation = {
  id: number;
  book_id: number;
  user_id: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
};

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  // Enable sending cookies with requests (for server-side auth)
  withCredentials: true,
});

/**
 * Request interceptor: Add auth token to API requests
 * - Client-side: Retrieves token from localStorage
 * - Server-side: Token passed via cookies or context
 * Supports both SPA and SSR authentication flows
 */
client.interceptors.request.use(
  (config) => {
    // Client-side: Add token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Server-side: Cookies automatically included due to withCredentials
    // Token can also be extracted from context in getServerSideProps
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Centralized error handler for API responses
 */
const handleError = (error: AxiosError) => {
  const message =
    (error.response?.data as any)?.detail ||
    (error.response?.data as any)?.message ||
    error.message ||
    'An API error occurred';

  const customError = new Error(message);
  throw customError;
};

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleError(error);
  }
);

/**
 * Fetch all books
 */
export async function fetchBooks(): Promise<Book[]> {
  const resp = await client.get('/books');
  return resp.data as Book[];
}

/**
 * Fetch single book details
 */
export async function fetchBook(id: string): Promise<Book> {
  const resp = await client.get(`/books/${id}`);
  return resp.data as Book;
}

/**
 * Create a new book
 */
export async function createBook(book: Partial<Book>): Promise<Book> {
  const resp = await client.post('/books', book);
  return resp.data as Book;
}

/**
 * Upload book content file
 */
export async function uploadBookFile(bookId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const resp = await client.post(`/books/${bookId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return resp.data;
}

/**
 * Borrow a book
 */
export async function borrowBook(bookId: string): Promise<Borrow> {
  const resp = await client.post(`/books/${bookId}/borrow`);
  return resp.data as Borrow;
}

/**
 * Return a borrowed book
 */
export async function returnBook(bookId: string): Promise<any> {
  const resp = await client.post(`/books/${bookId}/return`);
  return resp.data;
}

/**
 * Get user's active borrows
 */
export async function getUserBorrows(userId: string): Promise<Borrow[]> {
  const resp = await client.get(`/borrows/user/${userId}`);
  return resp.data as Borrow[];
}

/**
 * Create a review for a book
 */
export async function createReview(bookId: string, review: Partial<Review>): Promise<Review> {
  const resp = await client.post(`/books/${bookId}/reviews`, review);
  return resp.data as Review;
}

/**
 * Get reviews for a book
 */
export async function getBookReviews(bookId: string): Promise<Review[]> {
  const resp = await client.get(`/books/${bookId}/reviews`);
  return resp.data as Review[];
}

/**
 * Get personalized recommendations for user
 */
export async function getUserRecommendations(userId: string, limit: number = 5): Promise<Book[]> {
  const resp = await client.get(`/books/user/${userId}/recommendations?limit=${limit}`);
  return resp.data as Book[];
}

/**
 * Get content-based recommendations for a book
 */
export async function getBookRecommendations(bookId: string, limit: number = 5): Promise<Book[]> {
  const resp = await client.get(`/books/${bookId}/recommendations?limit=${limit}`);
  return resp.data as Book[];
}

/**
 * ============== AUTH ENDPOINTS ==============
 */

/**
 * Register a new user account
 */
export async function signup(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const resp = await client.post('/auth/register', {
    email,
    password,
    full_name: fullName,
  });
  return resp.data as AuthResponse;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const resp = await client.post('/auth/login', { email, password });
  return resp.data as AuthResponse;
}

/**
 * Logout (revoke tokens)
 */
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

/**
 * Get current authenticated user info
 */
export async function getCurrentUser(): Promise<User> {
  const resp = await client.get('/auth/me');
  return resp.data as User;
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const resp = await client.post('/auth/refresh', { refresh_token: refreshToken });
  return resp.data as AuthResponse;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<any> {
  const resp = await client.post('/auth/password-reset', { email });
  return resp.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<any> {
  const resp = await client.post('/auth/password-reset/confirm', {
    token,
    new_password: newPassword,
  });
  return resp.data;
}

/**
 * ============== USER MANAGEMENT ENDPOINTS ==============
 */

/**
 * Get all users (admin only)
 */
export async function fetchAllUsers(page: number = 1, limit: number = 10): Promise<any> {
  const resp = await client.get(`/users?page=${page}&limit=${limit}`);
  return resp.data;
}

/**
 * Get user details by ID
 */
export async function fetchUser(userId: number): Promise<User> {
  const resp = await client.get(`/users/${userId}`);
  return resp.data as User;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: 'user' | 'admin'): Promise<User> {
  const resp = await client.put(`/users/${userId}`, { role });
  return resp.data as User;
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: number): Promise<any> {
  const resp = await client.delete(`/users/${userId}`);
  return resp.data;
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats(): Promise<any> {
  const resp = await client.get('/users/stats');
  return resp.data;
}

/**
 * ============== DOCUMENT MANAGEMENT ENDPOINTS ==============
 */

/**
 * Get all documents (with optional book filter)
 */
export async function fetchDocuments(bookId?: number): Promise<Document[]> {
  const url = bookId ? `/documents?book_id=${bookId}` : '/documents';
  const resp = await client.get(url);
  return resp.data as Document[];
}

/**
 * Get document details by ID
 */
export async function fetchDocument(documentId: number): Promise<Document> {
  const resp = await client.get(`/documents/${documentId}`);
  return resp.data as Document;
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: number): Promise<any> {
  const resp = await client.delete(`/documents/${documentId}`);
  return resp.data;
}

/**
 * Get document preview/content
 */
export async function fetchDocumentContent(documentId: number): Promise<any> {
  const resp = await client.get(`/documents/${documentId}/content`);
  return resp.data;
}

/**
 * ============== INGESTION MANAGEMENT ENDPOINTS ==============
 */

/**
 * Trigger manual ingestion for a document
 */
export async function triggerIngestion(documentId: number): Promise<any> {
  const resp = await client.post(`/documents/${documentId}/ingest`, {});
  return resp.data;
}

/**
 * Get ingestion status for a document
 */
export async function fetchIngestionStatus(documentId: number): Promise<IngestionStatus> {
  const resp = await client.get(`/documents/${documentId}/ingest-status`);
  return resp.data as IngestionStatus;
}

/**
 * Get ingestion logs for a document
 */
export async function fetchIngestionLogs(documentId: number): Promise<IngestionLog[]> {
  const resp = await client.get(`/documents/${documentId}/ingest-logs`);
  return resp.data as IngestionLog[];
}

/**
 * Cancel ingestion for a document
 */
export async function cancelIngestion(documentId: number): Promise<any> {
  const resp = await client.post(`/documents/${documentId}/ingest-cancel`, {});
  return resp.data;
}

/**
 * Get all ingestion statuses (admin only)
 */
export async function fetchAllIngestionStatuses(): Promise<any> {
  const resp = await client.get('/documents/ingest-statuses');
  return resp.data;
}

/**
 * ============== Q&A / RAG ENDPOINTS ==============
 */

/**
 * Ask a question about a book (RAG-based)
 */
export async function askQuestion(bookId: number, question: string): Promise<QAResponse> {
  const resp = await client.post(`/ai/qa`, {
    book_id: bookId,
    question,
  });
  return resp.data as QAResponse;
}

/**
 * Get Q&A conversation history for a book
 */
export async function fetchQAHistory(bookId: number): Promise<QAResponse[]> {
  const resp = await client.get(`/books/${bookId}/qa-history`);
  return resp.data as QAResponse[];
}

/**
 * Clear Q&A conversation history for a book
 */
export async function clearQAHistory(bookId: number): Promise<any> {
  const resp = await client.delete(`/books/${bookId}/qa-history`);
  return resp.data;
}

/**
 * Generate document summary
 */
export async function generateSummary(documentId: number): Promise<any> {
  const resp = await client.post(`/documents/${documentId}/summarize`, {});
  return resp.data;
}

export default client;
