import { QAResponse } from '@/services/api';

interface QAResultsProps {
  response: QAResponse;
  isLoading?: boolean;
}

export default function QAResults({ response, isLoading = false }: QAResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Answer Section */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
        <p className="text-gray-700 leading-relaxed">{response.answer}</p>
      </div>

      {/* Sources Section */}
      {response.sources && response.sources.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Sources</h3>
          <div className="space-y-2">
            {response.sources.map((source: any, idx: number) => (
              <div
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded p-3 hover:bg-blue-100 transition"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-blue-900">{source.document}</span>
                  {source.confidence && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-semibold">
                      {(source.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                <p className="text-gray-700 italic">"{source.excerpt}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      {response.timestamp && (
        <p className="text-xs text-gray-500">
          {new Date(response.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
