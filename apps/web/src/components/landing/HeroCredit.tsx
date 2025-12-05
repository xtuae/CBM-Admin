import { Link } from 'react-router-dom';
import { Card, Badge } from '../ui';

const HeroCredit = () => {
  return (
    <section className="grid md:grid-cols-2 gap-12 items-center">
      {/* Left Column */}
      <div className="space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
          Unlock, Manage, and Grow Your Digital Credits
        </h1>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          Purchase secure credit packs for games, cloud services, and digital tools. Top up your platform balance and track every transaction with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/marketplace" className="btn-primary text-lg px-8 py-4">
            Explore Credit Packs
          </Link>
          <button className="btn-secondary text-lg px-8 py-4">
            How It Works
          </button>
        </div>
      </div>

      {/* Right Column - Featured Card */}
      <div className="flex justify-center">
        <Card className="max-w-sm p-8 relative">
          <Badge className="absolute top-4 left-4">Popular Pack</Badge>
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-4xl">💳</span>
            </div>
            <div className="space-y-2">
              <div className="text-xl font-semibold text-white">Game Credits Bundle</div>
              <div className="text-2xl font-bold text-indigo-400">From $49</div>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
              <div className="w-6 h-6 bg-pink-600 rounded-full"></div>
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
              <div className="text-xs text-gray-400 ml-2">+12 more</div>
            </div>
            <div className="text-center text-sm text-gray-300">Trusted by thousands of users</div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default HeroCredit;