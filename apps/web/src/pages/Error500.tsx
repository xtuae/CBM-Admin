import { useState } from 'react';

interface Error500Props {
  error?: Error;
  resetError?: () => void;
}

const Error500 = ({ error, resetError }: Error500Props) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!resetError) {
      // Fallback: reload the page
      window.location.reload();
      return;
    }

    setIsRetrying(true);
    try {
      // Wait a bit to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetError();
    } catch (err) {
      // If reset fails, reload as fallback
      window.location.reload();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Error Illustration */}
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2-1.456 2-2.94 0-1.144-.5-2.056-1.47-2.56C16.877 12.962 14.5 12.5 12 12.5c-2.5 0-4.877.462-5.09 1.06C5.5 14.444 5 15.356 5 16.5c0 1.484.46 2.94 2 2.94z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Oops!
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Something went wrong
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              We're experiencing technical difficulties. Please try again in a moment.
            </p>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && error && (
              <div className="bg-gray-100 p-4 rounded-md mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Error Details (Development Mode):
                </h3>
                <code className="text-xs text-red-600 break-words">
                  {error.message}
                </code>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-700 hover:text-gray-900">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isRetrying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <button
                  onClick={() => window.history.back()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  ← Go Back
                </button>
                <span className="text-gray-500 hidden sm:block">•</span>
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Go Home
                </a>
                <span className="text-gray-500 hidden sm:block">•</span>
                <a
                  href="/browse"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Browse Marketplace
                </a>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If the problem persists, please{' '}
                <a href="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
                  contact our support team
                </a>
                {' '}with details about what you were doing when this error occurred.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Reference */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-4 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error500;
