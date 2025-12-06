import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNilaRate } from '../lib/fetchNilaRate'
import Modal from './Modal'
import { CreditPack, CreditPackFormData } from '../types/credit-pack'
import { uploadCreditPackImage, type UploadResult } from '../lib/uploadImage'
import { getCreditPackImageUrl } from '../lib/getCreditPackImageUrl'

interface CreditPackModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  pack?: CreditPack | null
}

const CreditPackModal = ({ isOpen, onClose, onSave, pack }: CreditPackModalProps) => {
  // Form states
  const [name, setName] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [usdPrice, setUsdPrice] = useState<number>(0);
  // Note: Credits represent NIL tokens, so credit_amount = NILA equivalent
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // NILA states - using hook with auto-update
  const { rate: nilaRateUsd, loading: nilaRateLoading, error: nilaRateError, refresh: loadNilaRate } = useNilaRate(true);
  const [nilaEquivalent, setNilaEquivalent] = useState<string>("0.000000");

  // Image states
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Categories states
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setCategories(categories || []);
      }
    } catch (err) {
      console.error('Unexpected error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (handled in upload function now, but let's clear any existing errors)
    setImageError(null);
    setImageUploading(true);

    try {
      const result = await uploadCreditPackImage(file);

      if (result.error) {
        setImageError(result.error);
      } else if (result.url) {
        setImageError(null);
        setFeaturedImageUrl(result.url);
        // Clear file input
        e.target.value = '';
      } else {
        setImageError("Upload completed but no URL returned. Please try again.");
      }
    } catch (err) {
      console.error('File upload error:', err);
      setImageError("An unexpected error occurred. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Initialize form when pack changes
  useEffect(() => {
    if (pack) {
      console.log('Initializing modal with pack:', pack.name, 'featured_image_url:', pack.featured_image_url);
      console.log('Setting selectedCategories to:', pack.category_ids || []);
      setName(pack.name);
      setShortDescription(pack.short_description);
      setUsdPrice(pack.price_usd);
      setCreditAmount(pack.credit_amount);
      setIsActive(pack.is_active);
      setIsFeatured(pack.is_featured);
      setFeaturedImageUrl(pack.featured_image_url || null);
      setNilaEquivalent(pack.nila_equivalent ? pack.nila_equivalent.toString() : "0.000000");
      setSelectedCategories(pack.category_ids || []);
    } else {
      setName('');
      setShortDescription('');
      setUsdPrice(0);
      setCreditAmount(0);
      setIsActive(true);
      setIsFeatured(false);
      setFeaturedImageUrl(null);
      setNilaEquivalent("0.000000");
      setSelectedCategories([]);
    }
    setImageError(null);
  }, [pack, isOpen]);



 useEffect(() => {
   // Credits = NILA equivalent (since credits represent NIL tokens)
   if (nilaRateUsd && nilaRateUsd > 0 && usdPrice > 0) {
     const nilEquivalent = usdPrice / nilaRateUsd;
     setCreditAmount(Math.round(nilEquivalent)); // Round to whole credits
     setNilaEquivalent(nilEquivalent.toFixed(6));
   } else {
     setCreditAmount(0);
     setNilaEquivalent("0.000000");
   }
 }, [usdPrice, nilaRateUsd]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      console.log('Saving credit pack with featured_image_url:', featuredImageUrl);

      const payload = {
        name,
        slug,
        short_description: shortDescription,
        long_description_html: shortDescription, // or actual rich HTML if present
        credit_amount: creditAmount,
        price_usd: usdPrice,
        price_fiat: usdPrice,       // keep matching USD for now
        currency: "USD",

        nila_equivalent:
          nilaRateUsd && nilaRateUsd > 0
            ? parseFloat((usdPrice / nilaRateUsd).toFixed(6))
            : null,
        is_active: isActive,
        is_featured: isFeatured,
        featured_image_url: featuredImageUrl,
        gallery_urls: [], // empty for now
        category_ids: selectedCategories,
        seo_title: name, // or actual
        seo_description: shortDescription,
        seo_keywords: [] // empty for now
      };

      if (pack?.id) {
        // Update
        const { error } = await supabase
          .from('credit_packs')
          .update(payload)
          .eq('id', pack.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('credit_packs')
          .insert([payload]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving credit pack:', error);
      alert('Error saving credit pack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pack ? 'Edit Credit Pack' : 'Create Credit Pack'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            className="input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Starter Pack"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="short_description"
            required
            rows={3}
            className="input mt-1"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Describe the credit pack..."
          />
        </div>

        {/* USD Price */}
        <div>
          <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700">
            USD Price *
          </label>
          <input
            type="number"
            id="price_usd"
            required
            min="0"
            step="0.01"
            className="input mt-1"
            value={usdPrice}
            onChange={(e) => setUsdPrice(parseFloat(e.target.value) || 0)}
            placeholder="29.99"
          />
        </div>

        {/* Credits (read-only, auto-calculated) */}
        <div>
          <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
            Credits *
          </label>
          <input
            type="number"
            id="credits"
            readOnly
            className="input mt-1 bg-gray-50"
            value={creditAmount}
            placeholder="0"
          />
        </div>

        {/* Current NILA Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current NILA Rate (USD)
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              readOnly
              className="input bg-gray-50"
              value={nilaRateLoading ? "Loading..." : nilaRateUsd ? nilaRateUsd.toString() : "Failed"}
            />
            <button
              type="button"
              onClick={loadNilaRate}
              className="btn"
              disabled={nilaRateLoading}
            >
              Refresh $NILA Rate
            </button>
          </div>
          {nilaRateError && (
            <p className="text-red-500 text-sm mt-2">
              {nilaRateError}
            </p>
          )}
        </div>

        {/* NILA Equivalent */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            NILA Equivalent
          </label>
          <input readOnly className="input bg-gray-50 mt-1" value={nilaEquivalent} />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Featured Image
          </label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload featured image (JPG, PNG, GIF, WebP - max 5MB)
            </p>
            {!featuredImageUrl && (
              <p className="text-xs text-gray-500 mt-1">
                No image uploaded yet. Placeholder will be used.
              </p>
            )}
            {imageUploading && (
              <p className="text-xs text-gray-500 mt-2">Uploading image…</p>
            )}
            {imageError && (
              <p className="text-xs text-red-500 mt-2">{imageError}</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          {categoriesLoading ? (
            <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500 mt-1">No categories available</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  />
                  <span className="ml-2 block text-sm text-gray-900">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Select categories for this credit pack
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active (visible to customers)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
          >
            {loading ? 'Saving...' : (pack ? 'Update Pack' : 'Create Pack')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreditPackModal
