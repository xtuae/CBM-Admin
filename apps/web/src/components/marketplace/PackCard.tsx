import { Link } from 'react-router-dom';
import { Card, Badge } from '../ui';

interface PackCardProps {
  pack: {
    id: string;
    name: string;
    credit_amount: number;
    price_usd: number;
    categories?: Array<{ name: string }>;
    is_featured?: boolean;
  };
}

const PackCard = ({ pack }: PackCardProps) => {
  // Check if pack is popular (placeholder logic)
  const isPopular = Math.random() > 0.7;
  const isNew = Math.random() > 0.8;

  return (
    <Card className="group hover:shadow-elevated hover:border-gray-300 transition-all duration-200 p-6">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden rounded-lg mb-4">
        <svg className="w-16 h-16 text-white/70 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Category Badges */}
        {pack.categories && pack.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pack.categories.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="secondary">
                {category.name}
              </Badge>
            ))}
            {pack.categories.length > 2 && (
              <Badge variant="secondary">
                +{pack.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Status Badges */}
        <div className="flex gap-2">
          {isPopular && <Badge variant="primary">Popular</Badge>}
          {isNew && <Badge>New</Badge>}
          {pack.is_featured && <Badge>Featured</Badge>}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {pack.name}
        </h3>

        {/* Credits Amount */}
        <p className="text-indigo-400 font-semibold">
          {pack.credit_amount.toLocaleString()} Digital Credits
        </p>

        {/* Price */}
        <p className="text-2xl font-bold text-white">
          ${pack.price_usd.toFixed(2)}
        </p>

        {/* CTA Button */}
        <Link
          to={`/marketplace/${pack.id}`}
          className="btn-primary w-full text-center"
        >
          View Pack
        </Link>
      </div>
    </Card>
  );
};

export default PackCard;