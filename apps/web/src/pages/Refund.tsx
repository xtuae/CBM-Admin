import { Link } from 'react-router-dom';

const Refund = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/policies" className="hover:text-gray-700">Policies</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Refund Policy</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-lg text-gray-600">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">

            <h2>1. Digital Credits Policy</h2>

            <h3>1.1 General Rule</h3>
            <p>
              <strong>All purchases of digital credits on Credits Marketplace are final and non-refundable.</strong>
              Digital credits are delivered instantly upon successful payment and provide immediate value
              to our customers. Due to the nature of digital goods, we cannot provide refunds once credits
              have been delivered to your account.
            </p>

            <h3>1.2 Instant Delivery</h3>
            <p>
              Credits are added to your account balance immediately upon successful payment confirmation.
              At this point, the transaction is complete, and the digital nature of our products prevents
              us from reversing or recalling the credits.
            </p>

            <h2>2. Exceptions to Refund Policy</h2>

            <h3>2.1 Payment Processing Failures</h3>
            <p>
              If your payment was successfully charged but credits were not delivered due to a technical
              error on our end, we will promptly add the credits to your account and issue a full refund
              if you prefer. Please contact our support team within 24 hours of your purchase.
            </p>

            <h3>2.2 Duplicate Charges</h3>
            <p>
              If you were accidentally charged multiple times for the same purchase, we will issue a full
              refund for the duplicate charge(s) upon verification.
            </p>

            <h3>2.3 Fraud Prevention</h3>
            <p>
              In cases of suspected fraud or unauthorized transactions, we may issue refunds as part of
              our security protocols. Such determinations are made at our sole discretion.
            </p>

            <h2>3. Credit Usage and Validity</h2>

            <h3>3.1 Credit Expiry</h3>
            <p>
              Digital credits purchased from Credits Marketplace do not expire and can be used at any time
              for available services on our platform.
            </p>

            <h3>3.2 Partial Usage</h3>
            <p>
              Once credits are used for any service, no partial refunds are available for the remaining
              unused credits in your account.
            </p>

            <h2>4. Billing Disputes</h2>

            <h3>4.1 Card Chargebacks</h3>
            <p>
              Unauthorized chargebacks through your payment provider may result in account suspension
              or termination. We encourage you to contact our support team first to resolve any billing
              concerns before initiating chargebacks.
            </p>

            <h3>4.2 Subscription Services</h3>
            <p>
              For any subscription-based services offered through our platform, refunds are provided
              according to the terms of that specific service. Generally, partial refunds may be available
              for unused portions of subscription periods.
            </p>

            <h2>5. Returns and Exchanges</h2>

            <h3>5.1 Digital Nature</h3>
            <p>
              Due to the intangible nature of our products (digital credits), we do not accept returns
              or offer exchanges. If you receive the wrong amount of credits due to our error, we will
              correct the issue immediately.
            </p>

            <h2>6. Refund Processing</h2>

            <h3>6.1 Processing Time</h3>
            <p>
              Approved refunds are typically processed within 3-5 business days and will appear on your
              original payment method within 5-10 business days, depending on your payment provider.
            </p>

            <h3>6.2 Original Payment Method</h3>
            <p>
              Refunds are issued to the same payment method used for the original purchase whenever possible.
            </p>

            <h2>7. Contact Information</h2>

            <h3>7.1 Refund Requests</h3>
            <p>
              To request a refund consideration, please contact our support team with:
            </p>
            <ul>
              <li>Your account email address</li>
              <li>Order confirmation number (if available)</li>
              <li>Detailed description of the issue</li>
              <li>Any relevant screenshots or documentation</li>
            </ul>

            <h3>7.2 Response Time</h3>
            <p>
              Our support team will acknowledge receipt of your refund request within 24 hours and aim
              to provide a resolution within 48-72 hours for qualifying cases.
            </p>

            <h2>8. Policy Changes</h2>
            <p>
              Credits Marketplace reserves the right to modify this Refund Policy at any time. Changes
              will be effective immediately upon posting on our website. We encourage you to review this
              policy periodically.
            </p>

            <h2>9. Alternative Resolution</h2>

            <h3>9.1 Credit Compensation</h3>
            <p>
              In cases where refunds are not applicable, we may offer additional credits or account
              benefits as compensation for genuine service issues.
            </p>

            <h3>9.2 Account Credits</h3>
            <p>
              For eligible service interruptions or errors, we may provide bonus credits to affected
              customers as goodwill gestures.
            </p>

          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notice About Digital Purchases
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Digital credits are intangible goods delivered instantly upon payment. This policy is
                  designed to protect both our customers and our platform's sustainability. Please
                  carefully consider your purchases and contact support if you have any questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help with a Purchase?</h3>
          <p className="text-gray-600 mb-6">
            If you're considering a purchase or have questions about our refund policy,
            our support team is here to help you understand your options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
            >
              Contact Support
            </Link>
            <Link
              to="/marketplace"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-md font-medium border border-blue-600 transition-colors duration-200 text-center"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refund;
