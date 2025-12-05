import { Card } from '../ui';

const CategoriesGrid = () => {
  const categories = [
    { name: 'Game Credits', desc: 'Top up gaming accounts', icon: '🎮' },
    { name: 'Cloud & SaaS', desc: 'Hosting and software credits', icon: '☁️' },
    { name: 'Gift Cards', desc: 'Digital gift certificates', icon: '🎁' },
    { name: 'Business Tools', desc: 'Productivity and automation', icon: '💼' }
  ];

  return (
    <section className="py-16">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">All Categories</h2>
          <p className="text-gray-400">Find the perfect credit pack for your needs</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.name} className="p-6 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
              <p className="text-gray-400 mb-4">{category.desc}</p>
              <button className="btn-secondary w-full">Browse</button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;