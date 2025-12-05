const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
        <p className="text-xl text-gray-300">
          Revolutionizing digital credits marketplace with secure, instant delivery
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            We provide a secure, transparent platform for purchasing and managing digital credits.
            Our mission is to simplify digital commerce by offering instant credit delivery
            through traditional payment methods, while maintaining the highest standards of
            security and user experience.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Every transaction is secured with bank-level encryption, and our platform ensures
            that credits are allocated instantly upon successful payment verification.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">What We Offer</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure digital credit marketplace
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant credit allocation
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No expiration dates
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Comprehensive credit ledger tracking
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Payments</h3>
            <p className="text-gray-400 text-sm">Bank-level security for all transactions</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Delivery</h3>
            <p className="text-gray-400 text-sm">Credits added immediately after payment</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quality Guaranteed</h3>
            <p className="text-gray-400 text-sm">100% satisfaction with every purchase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
