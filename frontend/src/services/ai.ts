/**
 * AI Service
 */

import { QAResponse } from '../types';
import api from './api';

export const aiService = {
  /**
   * Generate summary for content
   */
  async generateSummary(content: string, maxLength?: number): Promise<string> {
    try {
      const response = await api.post<{ summary: string }>(
        '/ai/generate-summary',
        {
          content,
          max_length: maxLength || 500,
        }
      );
      return response.data.summary;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to generate summary');
    }
  },

  /**
   * Get book recommendations
   */
  async getRecommendations(preferences: string, topK?: number): Promise<string> {
    try {
      const response = await api.post<{ recommendations: string }>(
        '/ai/recommendations',
        {
          user_preferences: preferences,
          top_k: topK || 5,
        }
      );
      return response.data.recommendations;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to get recommendations'
      );
    }
  },

  /**
   * Ask question (RAG-based)
   */
  async askQuestion(question: string, topK?: number): Promise<QAResponse> {
    try {
      const response = await api.post<QAResponse>('/ai/qa', {
        question,
        top_k: topK || 3,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get answer');
    }
  },
};
