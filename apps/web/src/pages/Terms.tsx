const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-xl text-gray-300">
          Please read these terms carefully before using our services
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing and using the Digital Credits Marketplace ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
          <p className="leading-relaxed mb-4">
            Permission is granted to temporarily access the materials (information or software) on the Digital Credits Marketplace for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
            <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Digital Credits</h2>
          <p className="leading-relaxed mb-4">
            Digital credits purchased through our marketplace are non-refundable. Once credits are allocated to your account, they become your property and can be used according to our platform's rules.
          </p>
          <p className="leading-relaxed">
            Credits do not expire and remain valid indefinitely. However, we reserve the right to modify credit values or availability at our discretion.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Payment Terms</h2>
          <p className="leading-relaxed mb-4">
            All payments are processed securely through our payment partners. By making a payment, you agree to our payment processing terms and conditions.
          </p>
          <p className="leading-relaxed">
            Prices are subject to change without notice. The price charged will be the price in effect at the time of purchase.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">5. User Accounts</h2>
          <p className="leading-relaxed mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          <p className="leading-relaxed">
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Prohibited Uses</h2>
          <p className="leading-relaxed mb-4">
            You may not use our service:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Termination</h2>
          <p className="leading-relaxed">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
          <p className="leading-relaxed">
            In no event shall Digital Credits Marketplace, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which our company is incorporated, without regard to conflict of law provisions.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Terms</h2>
          <p className="leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          <p className="text-gray-300">
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@creditsmarketplace.com" className="text-indigo-400 hover:text-indigo-300">
              legal@creditsmarketplace.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
