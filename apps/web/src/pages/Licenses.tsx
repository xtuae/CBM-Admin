import { Link } from 'react-router-dom';

const Licenses = () => {
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
            <li className="text-gray-900">Licenses</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Licenses</h1>
          <p className="text-lg text-gray-600">
            Third-party licenses and open source components used in Credits Marketplace
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">

            <h2>1. Attribution and Acknowledgments</h2>
            <p>
              Credits Marketplace respects the intellectual property rights of others and complies
              with all applicable open source licenses. This page provides attribution and license
              information for third-party software, fonts, icons, and other components used in our platform.
            </p>

            <h2>2. Technology Stack</h2>
            <p>
              Our platform is built using modern web technologies and incorporates various open source libraries
              and frameworks. All licensing requirements are met and properly attributed.
            </p>

            <h3>2.1 Core Technologies</h3>
            <ul>
              <li><strong>React:</strong> Licensed under the MIT License</li>
              <li><strong>TypeScript:</strong> Licensed under Apache License 2.0</li>
              <li><strong>Tailwind CSS:</strong> Licensed under MIT License</li>
              <li><strong>Vite:</strong> Licensed under MIT License</li>
              <li><strong>Node.js:</strong> Licensed under various open source licenses</li>
            </ul>

            <h2>3. Open Source Libraries</h2>

            <h3>3.1 Frontend Libraries</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">React Router DOM</h4>
              <p className="text-sm text-gray-600 mb-2">Version 6.x - Declarative routing for React</p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/remix-run/react-router" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © Remix Software</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">@supabase/supabase-js</h4>
              <p className="text-sm text-gray-600 mb-2">Supabase JavaScript client library</p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/supabase/supabase-js" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © Supabase</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Express.js</h4>
              <p className="text-sm text-gray-600 mb-2">Fast, unopinionated, minimalist web framework</p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/expressjs/express" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © StrongLoop, IBM, and other expressjs.com contributors</p>
            </div>

            <h3>3.2 Development Tools</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">ESLint</h4>
              <p className="text-sm text-gray-600 mb-2">JavaScript and TypeScript linting tool</p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/eslint/eslint" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © ESLint Contributors</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Prettier</h4>
              <p className="text-sm text-gray-600 mb-2">Code formatter</p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/prettier/prettier" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © James Long</p>
            </div>

            <h2>4. Fonts and Typography</h2>

            <h3>4.1 Font Stacks</h3>
            <p>
              Our platform uses system fonts and web-safe font stacks that do not require
              external font licenses. All text rendering relies on locally available fonts
              from your operating system.
            </p>

            <h2>5. Icons and Graphics</h2>

            <h3>5.1 Heroicons</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Many icons used throughout our platform are from Heroicons, a collection of
                beautiful hand-crafted SVG icons.
              </p>
              <p className="text-sm"><strong>License:</strong> MIT License</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/tailwindlabs/heroicons" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
              <p className="text-sm"><strong>Copyright:</strong> © Tailwind Labs, Inc.</p>
            </div>

            <h3>5.2 Custom Graphics</h3>
            <p>
              All custom graphics, illustrations, and visual elements are original creations
              of Credits Marketplace and are protected by our intellectual property rights.
            </p>

            <h2>6. Database and Infrastructure</h2>

            <h3>6.1 PostgreSQL</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Our database infrastructure utilizes PostgreSQL, an advanced open source
                relational database system.
              </p>
              <p className="text-sm"><strong>License:</strong> PostgreSQL License (BSD-style)</p>
              <p className="text-sm"><strong>Official Site:</strong> <a href="https://postgresql.org/" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">PostgreSQL</a></p>
            </div>

            <h3>6.2 Supabase</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Supabase provides backend infrastructure and real-time features for our platform.
              </p>
              <p className="text-sm"><strong>License:</strong> Apache License 2.0</p>
              <p className="text-sm"><strong>Repository:</strong> <a href="https://github.com/supabase/supabase" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">GitHub</a></p>
            </div>

            <h2>7. Security and Encryption</h2>

            <h3>7.1 SSL/TLS Libraries</h3>
            <p>
              Network security and encryption are handled by industry-standard SSL/TLS
              implementations that are part of modern web browsers and servers. These
              components use standard encryption algorithms and protocols.
            </p>

            <h2>8. Third-Party Services</h2>

            <h3>8.1 Payment Processing</h3>
            <p>
              Payment processing is handled through third-party payment gateways that
              comply with PCI DSS standards and maintain their own license compliance.
              Our platform integrates with these services through their public APIs.
            </p>

            <h2>9. License Compliance</h2>

            <h3>9.1 Compliance Statement</h3>
            <p>
              Credits Marketplace is committed to maintaining full compliance with all
              applicable open source licenses. We regularly audit our dependencies and
              update our license attributions as needed.
            </p>

            <h3>9.2 Attribution Requirements</h3>
            <p>
              Where required by license terms, we provide appropriate attribution and
              maintain copies of licenses for all incorporated software components.
            </p>

            <h2>10. Contact Information</h2>

            <h3>10.1 License Inquiries</h3>
            <p>
              For questions about licenses, attribution, or to request complete copies
              of any licenses mentioned on this page:
            </p>
            <ul>
              <li>Email: legal@creditsmarketplace.com</li>
              <li>Address: [Company Address]</li>
            </ul>

            <h3>10.2 License Updates</h3>
            <p>
              This license page is updated regularly to reflect changes in our technology
              stack and dependencies. Last updated: {new Date().toLocaleDateString()}
            </p>

          </div>
        </div>

        {/* Open Source Commitment */}
        <div className="bg-green-50 rounded-lg p-8 mb-8">
          <div className="text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">Open Source Commitment</h3>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Credits Marketplace believes in the power of open source software and is proud to contribute to and benefit from the global open source community.
            </p>
            <p className="text-sm text-gray-500">
              By using and contributing to open source projects, we help build a better, more collaborative technology ecosystem.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions About Licenses?</h3>
          <p className="text-gray-600 mb-6">
            If you need complete license text copies or have questions about our use of any
            third-party software, please reach out to our legal team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
            >
              Contact Legal Team
            </Link>
            <Link
              to="/about"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-md font-medium border border-blue-600 transition-colors duration-200 text-center"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Licenses;
