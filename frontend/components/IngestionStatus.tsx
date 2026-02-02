import { IngestionStatus as IngestionStatusType } from '@/services/api';

interface IngestionStatusProps {
  status: IngestionStatusType;
  onRetrigger?: () => void;
  onCancel?: () => void;
  isRetriggerLoading?: boolean;
  isCancelLoading?: boolean;
}

export default function IngestionStatus({
  status,
  onRetrigger,
  onCancel,
  isRetriggerLoading = false,
  isCancelLoading = false,
}: IngestionStatusProps) {
  const getStatusColor = (s: string): string => {
    switch (s) {
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

  const getProgressBarColor = (s: string): string => {
    switch (s) {
      case 'completed':
        return 'bg-green-600';
      case 'processing':
        return 'bg-blue-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Progress</h3>
          <p className="text-gray-600">{status.current_step || 'Processing document...'}</p>
        </div>
        <div className="flex gap-2">
          {status.status === 'processing' && onCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:bg-gray-400 transition"
            >
              {isCancelLoading ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
          {status.status !== 'processing' && onRetrigger && (
            <button
              onClick={onRetrigger}
              disabled={isRetriggerLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-400 transition"
            >
              {isRetriggerLoading ? 'Triggering...' : 'Retrigger'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(status.status)}`}
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{status.progress}%</span>
        </div>
      </div>

      {/* Status Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Status</p>
          <div className={`inline-block px-3 py-1 text-sm font-semibold rounded ${getStatusColor(status.status)}`}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </div>
        </div>

        {status.start_time && (
          <div className="bg-gray-50 rounded p-4">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Started</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(status.start_time)}</p>
          </div>
        )}

        {status.end_time && (
          <div className="bg-gray-50 rounded p-4">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Completed</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(status.end_time)}</p>
          </div>
        )}

        {status.start_time && status.end_time && (
          <div className="bg-gray-50 rounded p-4">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Duration</p>
            <p className="text-sm font-semibold text-gray-900">
              {Math.round(
                (new Date(status.end_time).getTime() - new Date(status.start_time).getTime()) /
                  1000
              )}s
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {status.error_message && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Error</p>
          <p className="text-sm text-red-700">{status.error_message}</p>
        </div>
      )}
    </div>
  );
}
