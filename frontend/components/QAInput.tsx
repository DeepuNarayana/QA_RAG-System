import { useState } from 'react';
import Button from './Button';

interface QAInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function QAInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask a question...',
  maxLength = 500,
}: QAInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question.trim());
    setQuestion('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </Button>
      </div>
      {question.length > 0 && (
        <p className="text-xs text-gray-500">
          {question.length} / {maxLength} characters
        </p>
      )}
    </form>
  );
}
