import { Card, Badge } from '../ui';

const TopPacksGrid = () => {
  // Placeholder data for credit packs
  const packs = Array.from({ length: 8 }, (_, i) => ({
    id: `pack-${i + 1}`,
    name: 'Premium Game Credits',
    credits: 500,
    price: 29.99,
    category: 'Gaming',
    isPopular: i % 3 === 0,
    isBestValue: i % 4 === 1
  }));

  return (
    <section className="py-16">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Top Credit Packs</h2>
          <p className="text-gray-400">Popular choices from our marketplace</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {packs.map((pack) => (
            <Card key={pack.id} className="p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
              {pack.isBestValue && <Badge className="mb-2">Best Value</Badge>}
              {pack.isPopular && !pack.isBestValue && <Badge variant="primary" className="mb-2">Popular</Badge>}
              <h3 className="text-lg font-semibold text-white mb-1">{pack.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{pack.credits} Credits</p>
              <div className="text-xl font-bold text-indigo-400 mb-4">${pack.price.toFixed(2)}</div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1">View Pack</button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopPacksGrid;