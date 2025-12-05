import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../ui';

interface SuggestedPack {
  id: string;
  slug: string;
  name: string;
  credit_amount: number;
  price_usd: number;
  image_url?: string;
  is_featured?: boolean;
}

interface SuggestedPacksProps {
  packs: SuggestedPack[];
  title?: string;
}

const SuggestedPacks = ({ packs, title = "You might also like" }: SuggestedPacksProps) => {
  if (!packs.length) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover more credit packs that might interest you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packs.map((pack) => (
            <Card key={pack.id} className="group hover:scale-105 transition-transform duration-300">
              <Link to={`/marketplace/${pack.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                  {pack.image_url ? (
                    <img
                      src={pack.image_url}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                      $
                    </div>
                  )}

                  {/* Badge overlays */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {pack.is_featured && (
                      <Badge variant="primary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {pack.name}
                  </h3>

                  <div className="text-lg text-gray-300 font-medium mb-2">
                    {pack.credit_amount.toLocaleString()} Credits
                  </div>

                  <div className="text-2xl font-bold text-white mb-4">
                    ${pack.price_usd.toFixed(2)}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors"
                  >
                    View Pack
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestedPacks;