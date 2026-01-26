/**
 * Type Definitions for the application
 */

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  owner_id: number;
  title: string;
  author: string;
  genre?: string;
  year_published?: number;
  description?: string;
  summary?: string;
  isbn?: string;
  pages?: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  review_text?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  owner_id: number;
  filename: string;
  file_path: string;
  file_size?: number;
  document_type: string;
  is_ingested: boolean;
  ingestion_status: 'pending' | 'processing' | 'completed' | 'failed';
  ingestion_error?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface QAResponse {
  answer: string;
  relevant_documents: string[];
  confidence: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
