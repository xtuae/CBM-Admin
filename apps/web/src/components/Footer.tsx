import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="container-max section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="text-lg font-semibold text-white">Credits Marketplace</div>
            <div className="text-muted-xs leading-relaxed max-w-sm">
              Unlock, manage, and grow your digital credits with our secure marketplace. Trusted by thousands of users worldwide.
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">Marketplace</div>
            <div className="space-y-2">
              <Link to="/" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Home
              </Link>
              <Link to="/marketplace" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Explore Marketplace
              </Link>
              <Link to="/cart" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Cart
              </Link>
              <Link to="/checkout" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Checkout
              </Link>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">Legal</div>
            <div className="space-y-2">
              <Link to="/terms" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Privacy
              </Link>
            </div>
          </div>

          {/* Column 4: Resources & Newsletter */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">Resources</div>
            <div className="space-y-2">
              <Link to="/help" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Help
              </Link>
              <Link to="/contact" className="block text-muted-xs hover:text-indigo-400 transition-colors">
                Contact
              </Link>
            </div>
            <div className="mt-6">
              <div className="text-sm font-medium text-white mb-2">Subscribe for updates</div>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input flex-1 rounded-r-none"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="text-muted-xs mt-1">
                Subscribe for product updates and new credit packs.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar: copyright */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-muted-xs">
            © {new Date().getFullYear()} Credits Marketplace. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
