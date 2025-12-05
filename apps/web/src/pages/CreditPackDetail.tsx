import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { Card } from '../components/ui';
import PackGallery from '../components/product/PackGallery';
import PackInfoPanel from '../components/product/PackInfoPanel';
import ProductTabs from '../components/product/ProductTabs';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreditPack {
  id: string;
  name: string;
  slug: string;
  credit_amount: number;
  price_usd: number;
  is_active: boolean;
  is_featured: boolean;
  short_description?: string;
  long_description?: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  categories: Category[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
  // For backward compatibility
  description?: string;
}

const CreditPackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [creditPack, setCreditPack] = useState<CreditPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCreditPack();
    }
  }, [id]);

  // Update page title and meta tags with SEO data
  useEffect(() => {
    if (creditPack) {
      // Update page title
      document.title = creditPack.seo_title || `${creditPack.name} - Digital Credits Marketplace`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content',
          creditPack.seo_description ||
          `Buy ${creditPack.name} for $${creditPack.price_usd.toFixed(2)} - ${creditPack.credit_amount.toLocaleString()} digital credits. Instant delivery, secure payment.`
        );
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content',
          creditPack.seo_keywords ||
          `${creditPack.name}, digital credits, marketplace, buy credits, instant delivery, secure payments`
        );
      }
    }
  }, [creditPack]);

  const fetchCreditPack = async () => {
    try {
      const response = await fetch(`/api/v1/credit-packs`);
      if (response.ok) {
        const data = await response.json();
        const pack = data.find((p: CreditPack) => p.id === id);
        setCreditPack(pack || null);
      }
    } catch (error) {
      console.error('Error fetching credit pack:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = (item: any, qty: number = quantity) => {
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const cartItem = {
      id: `${item.id}_${Date.now()}`, // Unique ID for cart item
      credit_pack_id: item.id,
      name: item.name,
      credits: item.credit_amount,
      price: item.price_usd,
      quantity: qty,
      processing_fee: 0.99,
    };

    // Add item to cart
    currentCart.push(cartItem);

    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
  };

  const handlePurchase = async (method: 'buy' | 'cart', qty: number = quantity) => {
    if (!creditPack) return;

    if (method === 'cart') {
      // Add to Cart - no auth required
      addToCart(creditPack, quantity);
      alert(`Added ${quantity} x ${creditPack.name} to cart!`);
      return;
    }

    // Buy Now - requires auth
    if (!user) {
      // Store current URL for post-login redirect
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      setProcessingId(creditPack.id);

      // Get the authenticated user's session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          credit_pack_id: creditPack.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { payment_session } = await response.json();

      // For "Buy Now", go directly to checkout
      // In a real app, this would navigate to a checkout page
      await simulatePaymentSuccess(payment_session.session_id.replace('session_', ''));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error purchasing credit pack:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Mock function to simulate payment success webhook
  const simulatePaymentSuccess = async (orderId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch('/api/v1/webhooks/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'mock-signature',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: `pay_${Date.now()}`,
          status: 'paid',
          amount: creditPack?.price_usd || 0,
          currency: 'USD',
        }),
      });
    } catch (error) {
      console.error('Error simulating payment:', error);
    }
  };

  if (loading) {
    return (
      <>
        <section className="py-24">
          <div className="container-max">
            {/* Breadcrumb skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <ProductDetailSkeleton />
          </div>
        </section>
      </>
    );
  }

  if (!creditPack) {
    return (
      <>
        <section className="py-24">
          <div className="container-max text-center">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.709-2.373C6.288 12.045 7.05 12 7.828 12H12.2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">Credit pack not found</h3>
            <p className="mt-1 text-sm text-gray-400">The credit pack you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link
                to="/marketplace"
                className="text-indigo-400 hover:text-indigo-300"
              >
                ← Back to Marketplace
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Build breadcrumb items: Home → Browse Marketplace → [Category] → [Product Name]
  const breadcrumbItems: Array<{ label: string; href?: string; current?: boolean }> = [
    { label: 'Browse Marketplace', href: '/marketplace' },
  ];

  // Add category to breadcrumb if available
  if (creditPack.categories && creditPack.categories.length > 0) {
    const primaryCategory = creditPack.categories[0]; // Use first category
    breadcrumbItems.push({
      label: primaryCategory.name,
      href: `/marketplace?category=${primaryCategory.slug}`
    });
  }

  // Add product name (current page)
  breadcrumbItems.push({ label: creditPack.name, current: true });

  // Badge logic
  const isNew = () => {
    const createdDate = new Date(creditPack.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7; // New if created within last 7 days
  };

  const isPopular = () => Math.random() > 0.7; // Placeholder: 30% chance of being "popular"
  const isOnSale = creditPack.is_featured;

  return (
    <>
      <section className="py-24">
        <div className="container-max">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />
          <div className="mb-8"></div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Pack Gallery */}
            <PackGallery
              images={creditPack.gallery_urls || []}
              name={creditPack.name}
            />

            {/* Right: Pack Info Panel */}
            <PackInfoPanel
              pack={creditPack}
              onAddToCart={(qty) => handlePurchase('cart', qty)}
              onBuyNow={(qty) => handlePurchase('buy', qty)}
              loading={processingId === creditPack.id}
            />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="container-max">
          <ProductTabs
            description={creditPack.description}
            longDescription={creditPack.long_description}
            creditAmount={creditPack.credit_amount}
          />
        </div>
      </section>

      {/* Suggested Packs Carousel */}
      <section className="py-16">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">You might also like</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} className="p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-3xl">💎</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Similar Credit Pack</h3>
                <p className="text-gray-400 text-sm mb-2">500 Credits</p>
                <div className="text-xl font-bold text-indigo-400">$29.99</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CreditPackDetail;
