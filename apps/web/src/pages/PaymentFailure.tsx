import { Link } from 'react-router-dom';

const PaymentFailure = () => {
  return (
    <div className="min-h-[500px] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Failure Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Failure Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h2>
        <p className="text-gray-600 mb-8">
          We were unable to process your payment. This could be due to
          insufficient funds, card decline, or a temporary issue.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Try Payment Again
          </button>
          <Link
            to="/cart"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Review Cart
          </Link>
        </div>

        {/* Possible Solutions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">What you can try:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Check your card details are correct</li>
            <li>• Ensure sufficient funds are available</li>
            <li>• Try a different payment method</li>
            <li>• Contact your bank if issues persist</li>
          </ul>
        </div>

        {/* Support */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Still having issues? <Link to="/pages/contact" className="text-blue-600 hover:text-blue-500">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
