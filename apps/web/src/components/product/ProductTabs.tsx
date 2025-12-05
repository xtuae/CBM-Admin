import { useState } from 'react';
import { Card, TabFilter } from '../ui';

interface ProductTabsProps {
  description?: string;
  longDescription?: string;
  creditAmount: number;
}

const ProductTabs = ({ description, longDescription, creditAmount }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'What you get', value: 'what-you-get' },
    { label: 'Usage & delivery', value: 'usage' }
  ];

  return (
    <div className="space-y-6">
      <TabFilter
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Card className="p-8">
        {activeTab === 'details' && (
          <div className="prose prose-lg max-w-none text-gray-300">
            {longDescription ? (
              <div dangerouslySetInnerHTML={{ __html: longDescription }} />
            ) : (
              <div className="space-y-6">
                <p>
                  This credit pack contains {creditAmount.toLocaleString()} digital credits that can be redeemed for premium services on our platform.
                </p>
                <p>
                  Credits provide instant access to digital goods and services without traditional payment processing. All purchases are secured with enterprise-grade encryption.
                </p>
                <p>
                  Start using your credits immediately or save them for future premium service purchases across our entire platform ecosystem.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'what-you-get' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Included in this pack:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{creditAmount.toLocaleString()} digital credits for instant use</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Secure credit ledger tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">No expiration date - credits remain valid indefinitely</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Instant allocation upon successful payment</span>
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">How to use your credits:</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">1. Redeem in Dashboard</h4>
                <p className="text-gray-300">Access your credits from the dashboard and redeem them for platform services.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">2. Instant Allocation</h4>
                <p className="text-gray-300">Credits are allocated immediately after successful payment verification.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">3. Secure Processing</h4>
                <p className="text-gray-300">All transactions are processed securely with bank-level encryption.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">4. Multiple Uses</h4>
                <p className="text-gray-300">Use credits across different platform services and features as needed.</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductTabs;