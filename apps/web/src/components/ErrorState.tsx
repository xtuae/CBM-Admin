import { Button } from './ui';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorState = ({
  title,
  description,
  onRetry,
  retryLabel = 'Try Again',
  className = ''
}: ErrorStateProps) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
