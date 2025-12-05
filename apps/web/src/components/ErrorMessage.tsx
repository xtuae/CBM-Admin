import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  type?: 'api' | 'payment' | 'auth' | 'general';
  className?: string;
}

// Pre-configured error messages for common API errors
export const API_ERROR_MESSAGES = {
  'Failed to fetch credit packs': {
    title: 'Products Unavailable',
    message: 'We\'re having trouble loading our credit packs. Please try again or contact support if the problem persists.',
    actionLabel: 'Refresh Page',
    actionOnClick: () => window.location.reload()
  },
  'Failed to load orders': {
    title: 'Orders Unavailable',
    message: 'We\'re having trouble loading your orders. Please try again or contact support.',
    actionLabel: 'Retry',
    actionOnClick: () => window.location.reload()
  },
  'Failed to load credit summary': {
    title: 'Account Data Unavailable',
    message: 'We\'re having trouble loading your account information. Please try again.',
    actionLabel: 'Refresh',
    actionOnClick: () => window.location.reload()
  },
  'Authentication required': {
    title: 'Please Sign In',
    message: 'You need to be signed in to access this feature.',
    actionLabel: 'Sign In',
    actionHref: '/login'
  }
};

// Payment-specific errors
export const PAYMENT_ERROR_MESSAGES = {
  'Payment failed': {
    title: 'Payment Failed',
    message: 'Your payment could not be processed. Please check your payment details and try again.',
    actionLabel: 'Try Again',
    actionHref: '/checkout'
  },
  'Payment verification failed': {
    title: 'Payment Verification Error',
    message: 'We couldn\'t verify your payment. Don\'t worry, you haven\'t been charged. Please contact support.',
    actionLabel: 'Contact Support',
    actionHref: '/contact'
  },
  'Card declined': {
    title: 'Card Declined',
    message: 'Your card was declined by the payment processor. Please try a different payment method.',
    actionLabel: 'Try New Payment',
    actionHref: '/checkout'
  }
};

const ErrorMessage = ({
  title,
  message,
  actionLabel,
  actionHref,
  actionOnClick,
  type = 'general',
  className = ""
}: ErrorMessageProps) => {
  // Default titles based on error type
  const defaultTitles = {
    api: 'Loading Error',
    payment: 'Payment Error',
    auth: 'Authentication Error',
    general: 'Something went wrong'
  };

  const errorTitle = title || defaultTitles[type];

  // Default icons based on error type
  const getIcon = (): ReactNode => {
    const iconSize = "h-12 w-12";

    switch (type) {
      case 'api':
        return (
          <svg className={`${iconSize} text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'payment':
        return (
          <svg className={`${iconSize} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'auth':
        return (
          <svg className={`${iconSize} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconSize} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`max-w-md mx-auto px-4 py-8 ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4">
          {getIcon()}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {errorTitle}
        </h3>

        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        {(actionLabel && (actionHref || actionOnClick)) && (
          actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={actionOnClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
};

// Helper function to get error config from known error messages
export const getErrorConfig = (errorMessage: string, type: ErrorMessageProps['type'] = 'general') => {
  const allErrors = {
    ...API_ERROR_MESSAGES,
    ...PAYMENT_ERROR_MESSAGES
  };

  return allErrors[errorMessage as keyof typeof allErrors] || {
    title: undefined,
    message: errorMessage,
    actionLabel: type === 'general' ? 'Try Again' : undefined,
    actionOnClick: type === 'general' ? () => window.location.reload() : undefined
  };
};

export default ErrorMessage;
