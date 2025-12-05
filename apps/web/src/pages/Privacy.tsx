const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-300">
          Your privacy is important to us. Learn how we collect, use, and protect your data.
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed mb-4">
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Name and contact information (email address)</li>
            <li>Account credentials (username and password)</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Transaction history and credit usage data</li>
            <li>Communications with our support team</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
          <p className="leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
          <p className="leading-relaxed mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>With service providers who assist us in operating our platform</li>
            <li>To comply with legal obligations or protect our rights</li>
            <li>In connection with a business transfer or acquisition</li>
            <li>With your explicit consent</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Limited access to personal information on a need-to-know basis</li>
            <li>Secure payment processing through certified providers</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
          <p className="leading-relaxed">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Account data is retained while your account is active and for a reasonable period thereafter for compliance and legitimate business purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
          <p className="leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete data</li>
            <li>Deletion of your personal information</li>
            <li>Data portability</li>
            <li>Restriction or objection to processing</li>
          </ul>
          <p className="leading-relaxed mt-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
          <p className="leading-relaxed mb-4">
            We use cookies and similar technologies to enhance your experience on our platform. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Essential cookies for platform functionality</li>
            <li>Analytics cookies to understand usage patterns</li>
            <li>Preference cookies to remember your settings</li>
          </ul>
          <p className="leading-relaxed">
            You can control cookie preferences through your browser settings, though disabling certain cookies may affect platform functionality.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
          <p className="leading-relaxed">
            Our service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external parties. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
          <p className="leading-relaxed">
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-2">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <p className="text-gray-300">
            Email: <a href="mailto:privacy@creditsmarketplace.com" className="text-indigo-400 hover:text-indigo-300">privacy@creditsmarketplace.com</a>
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Last updated: December 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
