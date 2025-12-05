const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-xl text-gray-300">
          Get in touch with our team for support and inquiries
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Get In Touch</h2>
          <p className="text-gray-300 leading-relaxed">
            Have questions about our digital credits marketplace? Need help with your account
            or have suggestions for improvement? We're here to help. Reach out to our support team
            and we'll get back to you as soon as possible.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email Support</h3>
                <p className="text-gray-400">support@creditsmarketplace.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Response Time</h3>
                <p className="text-gray-400">Within 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Support Hours</h3>
                <p className="text-gray-400">Monday - Friday, 9 AM - 6 PM EST</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How do I purchase credits?</h3>
              <p className="text-gray-300 text-sm">
                Browse our marketplace, select your preferred credit pack, and proceed to checkout.
                Payment is processed securely, and credits are allocated instantly.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Are my payments secure?</h3>
              <p className="text-gray-300 text-sm">
                Yes, all payments are processed with bank-level encryption and security measures.
                We use industry-standard payment processors to ensure your data is protected.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How long do credits last?</h3>
              <p className="text-gray-300 text-sm">
                Digital credits purchased from our platform never expire. You can use them
                whenever you're ready to make purchases on supported services.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I get a refund?</h3>
              <p className="text-gray-300 text-sm">
                Due to the instant nature of digital credit delivery, refunds are not available
                once credits have been allocated. Please review purchases carefully before completing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
