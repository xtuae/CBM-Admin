import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import FiltersBar from '../components/marketplace/FiltersBar';
import ProductGrid from '../components/marketplace/ProductGrid';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreditPack {
  id: string;
  name: string;
  description: string;
  credit_amount: number;
  price_usd: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  is_featured?: boolean;
}

// Placeholder data for when Supabase is not seeded
const placeholderCategories: Category[] = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'cloud', name: 'Cloud Services', slug: 'cloud' },
  { id: 'business', name: 'Business Tools', slug: 'business' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
];

const placeholderPacks: CreditPack[] = Array.from({ length: 12 }, (_, i) => ({
  id: `pack-${i + 1}`,
  name: `Premium Credit Pack ${i + 1}`,
  description: `High-quality digital credits for various services. Pack ${i + 1} offers great value.`,
  credit_amount: 500 + (i * 100),
  price_usd: 19.99 + (i * 5),
  created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
  updated_at: new Date().toISOString(),
  categories: [
    placeholderCategories[Math.floor(Math.random() * (placeholderCategories.length - 1)) + 1]
  ],
  is_featured: i % 4 === 0,
}));

const BrowseMarketplace = () => {
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [categories, setCategories] = useState<Category[]>(placeholderCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recommended');

  // Fetch categories and credit packs with fallback to placeholder data
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        setCategories(placeholderCategories);
        return;
      }

      setCategories([{ id: 'all', name: 'All', slug: 'all' }, ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(placeholderCategories);
    }
  }, []);

  const fetchCreditPacks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packs')
        .select(`
          *,
          categories:credit_pack_categories!inner(
            categories!inner(*)
          )
        `)
        .eq('is_active', true)
        .limit(50);

      if (error || !data || data.length === 0) {
        // Use placeholder data if Supabase is not seeded
        let filteredPacks = [...placeholderPacks];

        // Apply client-side filtering
        if (selectedCategory && selectedCategory !== 'all') {
          filteredPacks = filteredPacks.filter(pack =>
            pack.categories?.some(cat => cat.id === selectedCategory)
          );
        }

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredPacks = filteredPacks.filter(pack =>
            pack.name.toLowerCase().includes(term) ||
            pack.description.toLowerCase().includes(term)
          );
        }

        // Apply sorting
        filteredPacks.sort((a, b) => {
          switch (sortBy) {
            case 'price_asc':
              return a.price_usd - b.price_usd;
            case 'price_desc':
              return b.price_usd - a.price_usd;
            case 'newest':
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });

        setCreditPacks(filteredPacks);
        return;
      }

      // Transform Supabase data
      const transformedData = data.map(pack => ({
        ...pack,
        categories: pack.categories ? pack.categories.map((cat: any) => cat.categories) : []
      }));

      setCreditPacks(transformedData);
    } catch (error) {
      console.error('Error fetching credit packs:', error);
      setCreditPacks(placeholderPacks);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchCategories();
      await fetchCreditPacks();
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    fetchCreditPacks();
  }, [fetchCreditPacks, selectedCategory, sortBy, searchTerm]);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortBy('recommended');
  };

  return (
    <>
      {/* Header Section */}
      <section className="py-24">
        <div className="container-max text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Browse Credit Packs
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Filter by category, find the right credit amount, and checkout in minutes.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-max">
          <FiltersBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
          />

          <ProductGrid
            packs={creditPacks}
            loading={loading}
          />
        </div>
      </section>
    </>
  );
};

export default BrowseMarketplace;
