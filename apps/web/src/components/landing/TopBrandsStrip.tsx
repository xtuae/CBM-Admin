import { Chip } from '../ui';

const TopBrandsStrip = () => {
  const brands = [
    'Game Credits',
    'Cloud Services',
    'Productivity Apps',
    'Advertising Credits',
    'API Services',
    'Data Storage'
  ];

  return (
    <section className="py-12">
      <div className="container-max">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white">Top Brands</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {brands.map((brand) => (
            <Chip key={brand} className="flex-shrink-0">
              {brand}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrandsStrip;