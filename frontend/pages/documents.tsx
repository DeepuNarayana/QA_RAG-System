import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDocuments, deleteDocument, fetchBooks, Document, Book } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import DocumentUpload from '@/components/DocumentUpload';
import { useError } from '@/context/ErrorContext';

export default function DocumentsPage() {
  const { addError } = useError();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents', selectedBook],
    queryFn: () => fetchDocuments(selectedBook || undefined),
  });

  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      addError({
        message: 'Document deleted successfully',
        type: 'info',
        duration: 3000,
      });
      refetch();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to delete document',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const handleDeleteDocument = (docId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(docId);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  const docList = documents || [];
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Document Management - Lumina Library</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Management</h1>
            <p className="text-gray-600">Upload, view, and manage your book documents</p>
          </div>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {showUpload ? 'Cancel' : '+ Upload Document'}
          </Button>
        </div>

        {showUpload && (
          <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Filter by Book */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Book:</label>
          <select
            value={selectedBook || ''}
            onChange={(e) => setSelectedBook(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Books</option>
            {books?.map((book: Book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
          </div>
        ) : docList.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {docList.map((doc: Document) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">📄</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.file_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {doc.ingestion_status === 'processing' && (
                            <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></div>
                          )}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.ingestion_status)}`}>
                            {doc.ingestion_status.charAt(0).toUpperCase() + doc.ingestion_status.slice(1)}
                          </span>
                          {doc.ingestion_progress !== undefined && doc.ingestion_status === 'processing' && (
                            <span className="text-xs text-gray-600">{doc.ingestion_progress}%</span>
                          )}
                        </div>
                        {doc.error_message && (
                          <p className="text-xs text-red-600 mt-1">{doc.error_message}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm gap-2 flex">
                        <button
                          onClick={() => {
                            // View document details/logs
                            window.location.href = `/ingestion?docId=${doc.id}`;
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          View Status
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                          disabled={deleteDocumentMutation.isPending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-500 text-lg mb-4">No documents found</p>
            <Button
              onClick={() => setShowUpload(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Upload Your First Document
            </Button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
