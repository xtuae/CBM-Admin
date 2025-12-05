import { Card } from '../ui';

const PopularBundlesList = () => {
  // Placeholder data for popular bundles
  const bundles = [
    {
      id: 'bundle-1',
      name: 'Gaming Bundle',
      seller: 'GB',
      itemCount: 5,
      price: 99,
      savings: 20,
      description: 'Includes 5 credit packs'
    },
    {
      id: 'bundle-2',
      name: 'Cloud Services Pack',
      seller: 'CSP',
      itemCount: 3,
      price: 149,
      savings: 25,
      description: 'Includes 3 cloud service packs'
    },
    {
      id: 'bundle-3',
      name: 'Business Tools Bundle',
      seller: 'BTB',
      itemCount: 4,
      price: 199,
      savings: 30,
      description: 'Includes 4 productivity tools'
    }
  ];

  return (
    <section className="py-16">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Popular Bundles</h2>
          <p className="text-gray-400">Save more with curated collections</p>
        </div>
        <div className="space-y-6">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{bundle.seller}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{bundle.name}</h3>
                  <p className="text-gray-400">{bundle.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {Array.from({ length: bundle.itemCount }, (_, j) => (
                    <div key={j} className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full border-2 border-gray-800"></div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-400">From ${bundle.price}</div>
                  <div className="text-sm text-gray-400">Save {bundle.savings}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularBundlesList;