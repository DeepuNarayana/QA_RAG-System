import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDocuments, askQuestion, fetchQAHistory, clearQAHistory, Document, QAResponse } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import { useError } from '@/context/ErrorContext';

export default function QAPage() {
  const { addError } = useError();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: QAResponse | string }>
  >([]);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const { data: qaHistory } = useQuery({
    queryKey: ['qa-history', selectedBookId],
    queryFn: () => (selectedBookId ? fetchQAHistory(selectedBookId) : null),
    enabled: !!selectedBookId,
  });

  const askQuestionMutation = useMutation({
    mutationFn: (q: string) => askQuestion(selectedBookId!, q),
    onSuccess: (response: QAResponse) => {
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: response },
      ]);
      setQuestion('');
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to get answer',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => clearQAHistory(selectedBookId!),
    onSuccess: () => {
      setConversationHistory([]);
      addError({
        message: 'Conversation history cleared',
        type: 'info',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to clear history',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedBookId) return;
    askQuestionMutation.mutate(question.trim());
  };

  const books = documents || [];
  const selectedBook = books.find((b: Document) => b.id === selectedBookId);

  return (
    <ProtectedRoute>
      <Head>
        <title>Q&A Assistant - Lumina Library</title>
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Q&A Assistant</h1>
          <p className="text-gray-600">Ask questions about your documents powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Book Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-20">
              <h2 className="text-lg font-bold mb-4">Books</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {books.length > 0 ? (
                  books.map((book: Document) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBookId(book.id);
                        setConversationHistory([]);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                        selectedBookId === book.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <div className="truncate">{book.file_name}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {book.ingestion_status === 'completed' ? '✓ Ready' : book.ingestion_status}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No documents available</p>
                )}
              </div>

              {selectedBookId && (
                <button
                  onClick={() => clearHistoryMutation.mutate()}
                  disabled={clearHistoryMutation.isPending}
                  className="w-full mt-4 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded text-sm transition"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>

          {/* Main Q&A Area */}
          <div className="lg:col-span-3">
            {selectedBook ? (
              <div className="bg-white rounded-lg shadow flex flex-col h-screen lg:h-96 lg:max-h-96">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {conversationHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <div className="text-4xl mb-4">💬</div>
                        <p className="text-gray-500 mb-2">Ask me anything about</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedBook.file_name}</p>
                        <p className="text-sm text-gray-400 mt-4">Start typing your question below</p>
                      </div>
                    </div>
                  ) : (
                    conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <p className="text-sm">{msg.content}</p>
                          ) : (
                            <div className="text-sm space-y-3">
                              <div>
                                <p className="font-semibold mb-2">Answer:</p>
                                <p className="text-gray-700">{(msg.content as QAResponse).answer}</p>
                              </div>
                              {(msg.content as QAResponse).sources && (
                                <div>
                                  <p className="font-semibold mb-2">Sources:</p>
                                  <div className="space-y-2">
                                    {(msg.content as QAResponse).sources.map((source: any, sidx: number) => (
                                      <div key={sidx} className="bg-white p-2 rounded border border-gray-300">
                                        <p className="text-xs font-medium text-gray-700 mb-1">
                                          {source.document} ({source.confidence?.toFixed(2) || 'N/A'})
                                        </p>
                                        <p className="text-xs text-gray-600 italic">"{source.excerpt}"</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <form onSubmit={handleAsk} className="flex gap-3">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question..."
                      disabled={askQuestionMutation.isPending}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <Button
                      type="submit"
                      disabled={askQuestionMutation.isPending || !question.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-400"
                    >
                      {askQuestionMutation.isPending ? 'Thinking...' : 'Ask'}
                    </Button>
                  </form>
                  {question.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {question.length} / 500 characters
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-500 text-lg mb-2">Select a book to get started</p>
                <p className="text-sm text-gray-400">Choose from your available documents in the sidebar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
