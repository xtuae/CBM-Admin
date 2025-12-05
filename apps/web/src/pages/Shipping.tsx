import { Link } from 'react-router-dom';

const Shipping = () => {
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
            <li className="text-gray-900">Delivery & Shipping Policy</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Delivery & Shipping Policy</h1>
          <p className="text-lg text-gray-600">
            Instant Digital Delivery - No Physical Shipping Required
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">

            <h2>1. Digital Delivery Model</h2>

            <h3>1.1 Instant Delivery</h3>
            <p>
              Credits Marketplace specializes exclusively in digital products and services. All purchases
              result in immediate digital delivery, with credits appearing in your account balance
              within seconds of successful payment confirmation.
            </p>

            <h3>1.2 No Physical Shipping</h3>
            <p>
              Since our products are entirely digital, there are no shipping fees, handling times,
              or physical delivery limitations. This allows us to provide instant access to your
              purchases from anywhere in the world.
            </p>

            <h2>2. Account Access Requirements</h2>

            <h3>2.1 Account Registration</h3>
            <p>
              To receive digital credits, you must have an active account on Credits Marketplace.
              Credits are automatically credited to your account balance and are immediately available
              for use.
            </p>

            <h3>2.2 Account Security</h3>
            <p>
              Your digital credits are securely stored in your account. Access to your account is
              protected by your login credentials, and credits can only be used by the account owner
              or with proper authorization.
            </p>

            <h2>3. Delivery Confirmation</h2>

            <h3>3.1 Immediate Confirmation</h3>
            <p>
              Upon successful payment processing, you will receive:
            </p>
            <ul>
              <li>Immediate visual confirmation on our platform</li>
              <li>Email notification with purchase details</li>
              <li>Updated account balance showing new credits</li>
              <li>Order history record for future reference</li>
            </ul>

            <h3>3.2 Technical Requirements</h3>
            <p>
              To access your digital credits, you need:
            </p>
            <ul>
              <li>An active internet connection</li>
              <li>A web browser or our mobile application</li>
              <li>Valid login credentials for your account</li>
            </ul>

            <h2>4. Global Access</h2>

            <h3>4.1 International Delivery</h3>
            <p>
              Digital credits can be accessed from any location worldwide, provided you have internet
              access and valid account credentials. Our platform is available 24/7, regardless of
              your geographical location or time zone.
            </p>

            <h3>4.2 Language and Currency Support</h3>
            <p>
              While our platform currently operates in English, digital credits have universal value
              and can be used for any supported services regardless of language preferences or local
              currency considerations.
            </p>

            <h2>5. Service Availability</h2>

            <h3>5.1 24/7 Access</h3>
            <p>
              Digital credits are available for use anytime, day or night. Our platform operates
              continuously with scheduled maintenance windows communicated in advance.
            </p>

            <h3>5.2 Service Reliability</h3>
            <p>
              We maintain high availability standards for our platform, with redundant systems
              ensuring minimal downtime. Credits remain accessible even during temporary service
              interruptions.
            </p>

            <h2>6. Transfer and Management</h2>

            <h3>6.1 Credit Transfers</h3>
            <p>
              Digital credits cannot be transferred between accounts for security reasons. Each
              account maintains its own credit balance, and credits can only be used by the
              account holder.
            </p>

            <h3>6.2 Credit Expiration</h3>
            <p>
              Digital credits purchased from Credits Marketplace do not expire and can be used
              at any time for eligible services on our platform.
            </p>

            <h2>7. Technical Support</h2>

            <h3>7.1 Delivery Issues</h3>
            <p>
              If you experience any issues with receiving your digital credits, please contact
              our support team immediately with your order details. We will investigate and
              resolve any delivery problems promptly.
            </p>

            <h3>7.2 Access Problems</h3>
            <p>
              Should you encounter difficulties accessing your account or viewing your credit
              balance, our technical support team is available to assist you 24/7.
            </p>

            <h2>8. Digital Product Nature</h2>

            <h3>8.1 No Physical Products</h3>
            <p>
              Credits Marketplace offers only digital products and services. We do not ship
              physical goods, CDs, USB drives, or any tangible products. All purchases result
              in digital credit balances only.
            </p>

            <h3>8.2 Environmental Impact</h3>
            <p>
              Our digital-only delivery model eliminates shipping emissions and packaging waste,
              making our platform environmentally friendly compared to traditional physical product
              distribution methods.
            </p>

            <h2>9. Communication</h2>

            <h3>9.1 Purchase Notifications</h3>
            <p>
              You will receive email confirmations for all purchases, including details about
              the credits purchased and your updated account balance.
            </p>

            <h3>9.2 Account Updates</h3>
            <p>
              Important updates about your account, credit balances, and platform changes
              will be communicated through your account dashboard and via email.
            </p>

            <h2>10. Policy Updates</h2>
            <p>
              This Delivery & Shipping Policy may be updated periodically to reflect improvements
              in our platform or changes in service offerings. Significant changes will be
              communicated to users through our platform announcements.
            </p>

          </div>
        </div>

        {/* Digital Delivery Benefits */}
        <div className="bg-green-50 rounded-lg p-8 mb-8">
          <div className="text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">Benefits of Digital Delivery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">Credits available immediately after payment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.    5a2 2 0 002 2h2a2 2 0 012 2v1.965M15 3.935V5.5a2 2 0 002 2h2a2 2 0 012 2v1.965" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No Shipping Costs</h4>
              <p className="text-sm text-gray-600">Zero delivery fees on all purchases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Access</h4>
              <p className="text-sm text-gray-600">Available worldwide 24/7</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions About Delivery?</h3>
          <p className="text-gray-600 mb-6">
            Our digital delivery system is designed for simplicity and reliability. If you have
            any questions about accessing your credits or using our platform, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
            >
              Get Support
            </Link>
            <Link
              to="/dashboard"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-md font-medium border border-blue-600 transition-colors duration-200 text-center"
            >
              Check Your Balance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
