import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBooks, uploadBookFile, Book } from '@/services/api';
import Button from './Button';
import { useError } from '@/context/ErrorContext';

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const { addError } = useError();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ bookId, file }: { bookId: string; file: File }) =>
      uploadBookFile(bookId, file),
    onSuccess: () => {
      addError({
        message: 'Document uploaded successfully and queued for ingestion',
        type: 'info',
        duration: 5000,
      });
      setSelectedFile(null);
      setSelectedBookId('');
      setUploadProgress(0);
      onUploadSuccess?.();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Upload failed',
        type: 'error',
        duration: 5000,
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain', 'text/csv'];
      if (!allowedTypes.includes(file.type)) {
        addError({
          message: 'Only PDF, TXT, and CSV files are allowed',
          type: 'error',
          duration: 5000,
        });
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        addError({
          message: 'File size must be less than 50MB',
          type: 'error',
          duration: 5000,
        });
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedBookId) {
      addError({
        message: 'Please select a file and a book',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      setUploadProgress(Math.floor(progress));
    }, 200);

    uploadMutation.mutate(
      { bookId: selectedBookId, file: selectedFile },
      {
        onSuccess: () => clearInterval(interval),
        onError: () => clearInterval(interval),
      }
    );
  };

  return (
    <div>
      <div className="space-y-4">
        {/* Book Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Book (required)
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            disabled={booksLoading || uploadMutation.isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Choose a book...</option>
            {books?.map((book: Book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Document (required)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition cursor-pointer bg-gray-50">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
              className="hidden"
              id="fileInput"
              accept=".pdf,.txt,.csv"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-600 font-medium">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, TXT, or CSV up to 50MB
              </p>
            </label>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedBookId || uploadMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
          <Button
            onClick={() => {
              setSelectedFile(null);
              setSelectedBookId('');
              setUploadProgress(0);
            }}
            disabled={uploadMutation.isPending}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold rounded-lg transition"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
