import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchDocuments,
  fetchIngestionStatus,
  fetchIngestionLogs,
  triggerIngestion,
  cancelIngestion,
  IngestionLog,
  Document,
} from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import { useError } from '@/context/ErrorContext';

export default function IngestionPage() {
  const router = useRouter();
  const { docId } = router.query;
  const { addError } = useError();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const selectedDocId = docId ? parseInt(docId as string) : null;
  const selectedDoc = documents?.find((d: Document) => d.id === selectedDocId) || documents?.[0];

  const { data: ingestionStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['ingestion-status', selectedDoc?.id],
    queryFn: () => (selectedDoc ? fetchIngestionStatus(selectedDoc.id) : null),
    enabled: !!selectedDoc,
    refetchInterval: autoRefresh ? 2000 : false,
  });

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ['ingestion-logs', selectedDoc?.id],
    queryFn: () => (selectedDoc ? fetchIngestionLogs(selectedDoc.id) : null),
    enabled: !!selectedDoc,
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const triggerMutation = useMutation({
    mutationFn: () => triggerIngestion(selectedDoc!.id),
    onSuccess: () => {
      addError({
        message: 'Ingestion triggered successfully',
        type: 'info',
        duration: 3000,
      });
      refetchStatus();
      refetchLogs();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to trigger ingestion',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelIngestion(selectedDoc!.id),
    onSuccess: () => {
      addError({
        message: 'Ingestion cancelled',
        type: 'info',
        duration: 3000,
      });
      refetchStatus();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to cancel ingestion',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'failed':
        return '✕';
      default:
        return '○';
    }
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

  const logList = logs || [];

  return (
    <ProtectedRoute>
      <Head>
        <title>Ingestion Monitoring - Lumina Library</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ingestion Monitoring</h1>
          <p className="text-gray-600">Monitor and manage document ingestion status</p>
        </div>

        {/* Document Selection */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Document:
          </label>
          <select
            value={selectedDoc?.id || ''}
            onChange={(e) =>
              router.push(`/ingestion?docId=${e.target.value}`)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a document...</option>
            {documents?.map((doc: Document) => (
              <option key={doc.id} value={doc.id}>
                {doc.file_name}
              </option>
            ))}
          </select>
        </div>

        {selectedDoc ? (
          <>
            {/* Document Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Document Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDoc.file_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(selectedDoc.file_size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uploaded</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDoc.upload_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        selectedDoc.ingestion_status
                      )}`}
                    >
                      {selectedDoc.ingestion_status.charAt(0).toUpperCase() +
                        selectedDoc.ingestion_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion Status Card */}
            {ingestionStatus && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ingestion Progress</h2>
                    <p className="text-gray-600">{ingestionStatus.current_step}</p>
                  </div>
                  <div className="flex gap-3">
                    {ingestionStatus.status === 'processing' && (
                      <Button
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                      >
                        {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    )}
                    {ingestionStatus.status !== 'processing' && (
                      <Button
                        onClick={() => triggerMutation.mutate()}
                        disabled={triggerMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                      >
                        {triggerMutation.isPending ? 'Triggering...' : 'Retrigger Ingestion'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        ingestionStatus.status === 'completed'
                          ? 'bg-green-600'
                          : ingestionStatus.status === 'failed'
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${ingestionStatus.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {ingestionStatus.progress}%
                    </span>
                  </div>
                </div>

                {/* Status Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-xs text-gray-600 uppercase">Status</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {ingestionStatus.status}
                    </p>
                  </div>
                  {ingestionStatus.start_time && (
                    <div className="bg-gray-50 rounded p-4">
                      <p className="text-xs text-gray-600 uppercase">Started</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(ingestionStatus.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  {ingestionStatus.end_time && (
                    <div className="bg-gray-50 rounded p-4">
                      <p className="text-xs text-gray-600 uppercase">Completed</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(ingestionStatus.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                {ingestionStatus.error_message && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-sm text-red-700">{ingestionStatus.error_message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Auto-Refresh Toggle */}
            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                Auto-refresh every 2-3 seconds
              </label>
            </div>

            {/* Ingestion Logs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Ingestion Logs</h2>
              {logList.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {logList.map((log: IngestionLog, idx: number) => (
                    <div
                      key={log.id || idx}
                      className={`p-3 rounded border-l-4 ${
                        log.status === 'error'
                          ? 'bg-red-50 border-red-400'
                          : log.status === 'warning'
                          ? 'bg-yellow-50 border-yellow-400'
                          : log.status === 'success'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {getStatusIcon(log.status)} {log.step}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No logs available yet</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-500 text-lg">No documents available to monitor</p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
