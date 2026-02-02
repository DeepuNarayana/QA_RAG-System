import { IngestionLog } from '@/services/api';

interface IngestionLogsProps {
  logs: IngestionLog[];
  isLoading?: boolean;
  maxHeight?: string;
}

export default function IngestionLogs({
  logs,
  isLoading = false,
  maxHeight = 'max-h-96',
}: IngestionLogsProps) {
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'error':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'success':
        return 'bg-green-50 border-l-4 border-green-400';
      default:
        return 'bg-blue-50 border-l-4 border-blue-400';
    }
  };

  const getTextColor = (status: string): string => {
    switch (status) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${maxHeight} overflow-y-auto p-4`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className={`flex items-center justify-center ${maxHeight} text-center`}>
        <p className="text-gray-500">No logs available yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${maxHeight} overflow-y-auto`}>
      {logs.map((log: IngestionLog, idx: number) => (
        <div
          key={log.id || idx}
          className={`p-3 rounded border-l-4 transition hover:shadow ${getStatusColor(log.status)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-bold ${getTextColor(log.status)}`}>
                  {getStatusIcon(log.status)}
                </span>
                <p className={`font-semibold ${getTextColor(log.status)}`}>
                  {log.step}
                </p>
              </div>
              <p className="text-sm text-gray-700">{log.message}</p>
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}