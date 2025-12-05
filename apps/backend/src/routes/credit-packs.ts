import { Router } from 'express';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import {
  validateUUIDParam,
  validatePositiveAmount,
  validatePositiveInteger,
  validateText,
  validateSlug,
  validateSlugUniqueness
} from '../middleware/validation';
import { logAdminActivity } from '../lib/errorHandler';

const router = Router();

// GET /api/v1/credit-packs - Get all active credit packs with optional filtering, searching, and sorting (public)
router.get('/', async (req, res): Promise<void> => {
  try {
    const {
      category_id,
      search,
      sort = 'created_at_desc',
      page = '1',
      page_size = '20'
    } = req.query;

    // Validate and sanitize pagination parameters
    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const pageSizeNum = Math.min(parseInt(String(page_size)) || 20, 100); // Max 100 results per page
    const offsetNum = (pageNum - 1) * pageSizeNum;

    // Build the base query for credit packs with categories
    let query = supabase
      .from('credit_packs')
      .select(`
        id,
        name,
        description,
        credit_amount,
        price_usd,
        created_at,
        updated_at,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('is_active', true);

    // Apply category filter if provided
    if (category_id) {
      query = query.eq('credit_pack_categories.category_id', category_id);
    }

    // Apply search filter if provided
    const searchTerm = String(search || '').trim();
    if (searchTerm.length > 0) {
      // Search in name and description (case-insensitive)
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply sorting based on sort parameter
    switch (sort) {
      case 'price_asc':
        query = query.order('price_usd', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_usd', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'popular':
        // For now, sort by credit amount (could be enhanced with actual usage metrics)
        query = query.order('credit_amount', { ascending: false });
        break;
      case 'created_at_desc':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offsetNum, offsetNum + pageSizeNum - 1);

    const { data: creditPacks, error } = await query;

    if (error) {
      console.error('Error fetching credit packs:', error);
      res.status(500).json({ error: 'Failed to fetch credit packs' });
      return;
    }

    // Transform the response to include categories as a clean array
    const transformedPacks = creditPacks?.map(pack => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      credit_amount: pack.credit_amount,
      price_usd: pack.price_usd,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      categories: pack.credit_pack_categories
        ?.map((cpc: any) => cpc.categories)
        .filter(Boolean) || []
    })) || [];

    res.json(transformedPacks);
  } catch (error) {
    console.error('Error in GET /credit-packs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// GET /api/v1/admin/credit-packs - Get all credit packs for admin management
router.get('/admin', authenticateAdmin, async (req, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const is_active = req.query.is_active as string;

    // Validate pagination parameters
    if (page < 1) {
      res.status(400).json({ error: 'Page must be 1 or greater' });
      return;
    }
    if (limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Limit must be between 1 and 100' });
      return;
    }

    const offset = (page - 1) * limit;

    // Build query with all fields for admin view
    let query = supabase
      .from('credit_packs')
      .select(`
        *,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply active filter if provided
    if (is_active !== undefined) {
      const isActiveBool = is_active === 'true';
      query = query.eq('is_active', isActiveBool);
    }

    const { data: creditPacks, error } = await query;

    if (error) {
      console.error('Error fetching credit packs:', error);
      res.status(500).json({ error: 'Failed to fetch credit packs' });
      return;
    }

    // Get total count for pagination
    let countQuery = supabase.from('credit_packs').select('*', { count: 'exact', head: true });

    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      countQuery = countQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (is_active !== undefined) {
      const isActiveBool = is_active === 'true';
      countQuery = countQuery.eq('is_active', isActiveBool);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting credit packs:', countError);
      res.status(500).json({ error: 'Failed to count credit packs' });
      return;
    }

    // Transform response to include categories properly
    const transformedPacks = creditPacks?.map(pack => ({
      ...pack,
      categories: pack.credit_pack_categories
        ?.map((cpc: any) => cpc.categories)
        .filter(Boolean) || [],
      credit_pack_categories: undefined // Remove original nested structure
    })) || [];

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: transformedPacks,
      pagination: {
        page,
        limit,
        total_count: totalCount || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error in GET /admin/credit-packs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/credit-packs/:id - Get detailed credit pack information
// GET /api/v1/admin/credit-packs/:id - Get detailed credit pack information
router.get('/admin/:id', authenticateAdmin, validateUUIDParam('id'), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: creditPack, error } = await supabase
      .from('credit_packs')
      .select(`
        *,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching credit pack:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Credit pack not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch credit pack' });
      return;
    }

    // Transform response to include categories as clean array
    const transformedPack = {
      ...creditPack,
      categories: creditPack.credit_pack_categories
        ?.map((cpc: any) => cpc.categories)
        .filter(Boolean) || [],
      credit_pack_categories: undefined // Remove nested structure
    };

    res.json(transformedPack);
  } catch (error) {
    console.error('Error in GET /admin/credit-packs/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/credit-packs?slug_check=:slug - Check if slug is unique (for frontend validation)
router.get('/', async (req, res): Promise<void> => {
  try {
    const { slug_check } = req.query;

    if (!slug_check || typeof slug_check !== 'string') {
      res.status(400).json({ error: 'slug_check parameter is required' });
      return;
    }

    const trimmedSlug = slug_check.trim();

    if (!trimmedSlug) {
      res.status(400).json({ error: 'Slug cannot be empty' });
      return;
    }

    // Check if slug exists
    const { data: existingPack, error } = await supabase
      .from('credit_packs')
      .select('id')
      .eq('slug', trimmedSlug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking slug uniqueness:', error);
      res.status(500).json({ error: 'Failed to validate slug' });
      return;
    }

    if (existingPack) {
      res.status(409).json({ error: `Slug "${trimmedSlug}" is already in use` });
      return;
    }

    res.json({ is_unique: true });
  } catch (error) {
    console.error('Error in GET /credit-packs (slug check):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/admin/credit-packs - Create a new credit pack
router.post('/admin', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const {
      name,
      slug,
      credits_amount,
      price_fiat,
      currency,
      is_active,
      is_featured,
      short_description,
      long_description,
      featured_image_url,
      gallery_urls,
      category_ids,
      seo_title,
      seo_description,
      seo_keywords
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required and must be a non-empty string' });
      return;
    }

    // Validate credits amount
    if (!credits_amount || typeof credits_amount !== 'number' || credits_amount < 1 || credits_amount > 1000000) {
      res.status(400).json({ error: 'Credit amount must be a number between 1 and 1000000' });
      return;
    }

    // Validate slug
    let validatedSlug = slug;
    if (!slug) {
      // Auto-generate slug from name
      validatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .substring(0, 100);
    }

    const slugValidation = validateSlug(validatedSlug);
    if (!slugValidation.isValid) {
      res.status(400).json({ error: slugValidation.errors.join(', ') });
      return;
    }

    validatedSlug = slugValidation.sanitizedData!;

    // Validate price (assume USD if no currency specified)
    const price_usd = price_fiat || 0;
    if (typeof price_usd !== 'number' || price_usd < 0 || price_usd > 10000) {
      res.status(400).json({ error: 'Price must be a number between 0 and 10000' });
      return;
    }

    // Validate currency if provided (for future multi-currency support)
    if (currency && typeof currency !== 'string') {
      res.status(400).json({ error: 'Currency must be a string' });
      return;
    }

    // Validate optional text fields
    if (short_description && (typeof short_description !== 'string' || short_description.length > 200)) {
      res.status(400).json({ error: 'Short description must be a string with maximum 200 characters' });
      return;
    }

    if (long_description && typeof long_description !== 'string') {
      res.status(400).json({ error: 'Long description must be a string' });
      return;
    }

    if (featured_image_url && (typeof featured_image_url !== 'string' || !/^https?:\/\/.+/.test(featured_image_url))) {
      res.status(400).json({ error: 'Featured image URL must be a valid HTTP/HTTPS URL' });
      return;
    }

    if (gallery_urls && (!Array.isArray(gallery_urls) || gallery_urls.some(url => typeof url !== 'string' || !/^https?:\/\/.+/.test(url)))) {
      res.status(400).json({ error: 'Gallery URLs must be an array of valid HTTP/HTTPS URLs' });
      return;
    }

    // Validate SEO fields
    if (seo_title && (typeof seo_title !== 'string' || seo_title.length > 70)) {
      res.status(400).json({ error: 'SEO title must be a string with maximum 70 characters' });
      return;
    }

    if (seo_description && (typeof seo_description !== 'string' || seo_description.length > 160)) {
      res.status(400).json({ error: 'SEO description must be a string with maximum 160 characters' });
      return;
    }

    if (seo_keywords && (typeof seo_keywords !== 'string' || seo_keywords.length > 255)) {
      res.status(400).json({ error: 'SEO keywords must be a string with maximum 255 characters' });
      return;
    }

    // Validate category_ids if provided
    if (category_ids) {
      if (!Array.isArray(category_ids)) {
        res.status(400).json({ error: 'Category IDs must be an array of UUID strings' });
        return;
      }

      // Check if categories exist
      if (category_ids.length > 0) {
        const { data: validCategories, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .in('id', category_ids);

        if (categoryError || !validCategories || validCategories.length !== category_ids.length) {
          res.status(400).json({ error: 'One or more category IDs are invalid' });
          return;
        }
      }
    }

    // Check slug uniqueness
    const { data: existingPack, error: slugCheckError } = await supabase
      .from('credit_packs')
      .select('id')
      .eq('slug', validatedSlug)
      .single();

    if (slugCheckError && slugCheckError.code !== 'PGRST116') {
      console.error('Error checking slug uniqueness:', slugCheckError);
      res.status(500).json({ error: 'Failed to validate slug uniqueness' });
      return;
    }

    if (existingPack) {
      res.status(409).json({ error: 'Credit pack with this slug already exists' });
      return;
    }

    // Create the credit pack
    const { data: creditPack, error: packError } = await supabase
      .from('credit_packs')
      .insert({
        name: name.trim(),
        slug: validatedSlug,
        credit_amount: credits_amount,
        price_usd: price_usd,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured || false,
        short_description: short_description?.trim() || null,
        long_description: long_description?.trim() || null,
        featured_image_url: featured_image_url?.trim() || null,
        gallery_urls: gallery_urls || [],
        seo_title: seo_title?.trim() || null,
        seo_description: seo_description?.trim() || null,
        seo_keywords: seo_keywords?.trim() || null,
      })
      .select()
      .single();

    if (packError) {
      console.error('Error creating credit pack:', packError);
      res.status(500).json({ error: 'Failed to create credit pack' });
      return;
    }

    // Log admin activity
    await logAdminActivity(
      req.user!.id,
      'created',
      'credit_pack',
      creditPack.id,
      {
        ip: req.ip,
        user_agent: req.get('User-Agent'),
      },
      {}, // No old values for creation
      {
        name: creditPack.name,
        slug: creditPack.slug,
        credit_amount: creditPack.credit_amount,
        price_usd: creditPack.price_usd,
        category_ids: category_ids || []
      }
    );

    // Add category relationships if provided
    let categoryInsertions: any[] = [];
    if (category_ids && category_ids.length > 0) {
      categoryInsertions = category_ids.map((categoryId: string) => ({
        credit_pack_id: creditPack.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('credit_pack_categories')
        .insert(categoryInsertions);

      if (categoryError) {
        console.error('Error creating category relationships:', categoryError);
        // Don't fail the entire request, but log the error
      }
    }

    // Return credit pack with populated categories
    const { data: responsePack, error: finalError } = await supabase
      .from('credit_packs')
      .select(`
        *,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', creditPack.id)
      .single();

    if (finalError) {
      console.error('Error fetching created credit pack:', finalError);
      res.status(201).json(creditPack); // Return basic pack if detailed fetch fails
      return;
    }

    // Transform response
    const transformedPack = {
      ...responsePack,
      categories: responsePack.credit_pack_categories
        ?.map((cpc: any) => cpc.categories)
        .filter(Boolean) || [],
      credit_pack_categories: undefined
    };

    res.status(201).json(transformedPack);
  } catch (error) {
    console.error('Error in POST /admin/credit-packs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

interface TransformedPack {
  id: string;
  name: string;
  categories: any[];
}

// PATCH /api/v1/admin/credit-packs/:id - Update a credit pack
router.patch('/admin/:id', authenticateAdmin, validateUUIDParam('id'), async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    let oldValues: any = {};

    // Get the current state before update for logging
    const { data: currentPack, error: fetchError } = await supabase
      .from('credit_packs')
      .select(`
        *,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .single();

    if (!fetchError && currentPack) {
      oldValues = {
        name: currentPack.name,
        slug: currentPack.slug,
        credit_amount: currentPack.credit_amount,
        price_usd: currentPack.price_usd,
        is_active: currentPack.is_active,
        is_featured: currentPack.is_featured,
        categories: (currentPack.credit_pack_categories || [])
          .map((cpc: any) => cpc.categories?.id).filter(Boolean) || []
      };
    }
    const {
      name,
      slug,
      credits_amount,
      price_fiat,
      currency,
      is_active,
      is_featured,
      short_description,
      long_description,
      featured_image_url,
      gallery_urls,
      category_ids,
      seo_title,
      seo_description,
      seo_keywords
    } = req.body;

    // Build update object with validation for provided fields
    const updateData: any = {};

    // Validate basic fields
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1) {
        res.status(400).json({ error: 'Name must be a non-empty string' });
        return;
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      const slugValidation = validateSlug(slug);
      if (!slugValidation.isValid) {
        res.status(400).json({ error: slugValidation.errors.join(', ') });
        return;
      }
      updateData.slug = slugValidation.sanitizedData!;
    }

    if (credits_amount !== undefined) {
      if (typeof credits_amount !== 'number' || credits_amount < 1 || credits_amount > 1000000) {
        res.status(400).json({ error: 'Credit amount must be a number between 1 and 1000000' });
        return;
      }
      updateData.credit_amount = credits_amount;
    }

    if (price_fiat !== undefined) {
      if (typeof price_fiat !== 'number' || price_fiat < 0 || price_fiat > 10000) {
        res.status(400).json({ error: 'Price must be a number between 0 and 10000' });
        return;
      }
      updateData.price_usd = price_fiat; // Map price_fiat to price_usd
    }

    if (currency !== undefined) {
      if (typeof currency !== 'string') {
        res.status(400).json({ error: 'Currency must be a string' });
        return;
      }
      // Note: Currency stored for future multi-currency support, but not persisted in table yet
    }

    // Handle boolean fields
    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }
    if (is_featured !== undefined) {
      updateData.is_featured = Boolean(is_featured);
    }

    // Validate text description fields
    if (short_description !== undefined) {
      if (short_description !== null && (typeof short_description !== 'string' || short_description.length > 200)) {
        res.status(400).json({ error: 'Short description must be a string with maximum 200 characters or null' });
        return;
      }
      updateData.short_description = short_description?.trim() || null;
    }

    if (long_description !== undefined) {
      if (long_description !== null && typeof long_description !== 'string') {
        res.status(400).json({ error: 'Long description must be a string or null' });
        return;
      }
      updateData.long_description = long_description?.trim() || null;
    }

    // Validate image URLs
    if (featured_image_url !== undefined) {
      if (featured_image_url !== null && (typeof featured_image_url !== 'string' || !/^https?:\/\/.+/.test(featured_image_url))) {
        res.status(400).json({ error: 'Featured image URL must be a valid HTTP/HTTPS URL or null' });
        return;
      }
      updateData.featured_image_url = featured_image_url?.trim() || null;
    }

    if (gallery_urls !== undefined) {
      if (gallery_urls !== null && (!Array.isArray(gallery_urls) || gallery_urls.some(url => typeof url !== 'string' || !/^https?:\/\/.+/.test(url)))) {
        res.status(400).json({ error: 'Gallery URLs must be an array of valid HTTP/HTTPS URLs or null' });
        return;
      }
      updateData.gallery_urls = gallery_urls || [];
    }

    // Validate SEO fields
    if (seo_title !== undefined) {
      if (seo_title !== null && (typeof seo_title !== 'string' || seo_title.length > 70)) {
        res.status(400).json({ error: 'SEO title must be a string with maximum 70 characters or null' });
        return;
      }
      updateData.seo_title = seo_title?.trim() || null;
    }

    if (seo_description !== undefined) {
      if (seo_description !== null && (typeof seo_description !== 'string' || seo_description.length > 160)) {
        res.status(400).json({ error: 'SEO description must be a string with maximum 160 characters or null' });
        return;
      }
      updateData.seo_description = seo_description?.trim() || null;
    }

    if (seo_keywords !== undefined) {
      if (seo_keywords !== null && (typeof seo_keywords !== 'string' || seo_keywords.length > 255)) {
        res.status(400).json({ error: 'SEO keywords must be a string with maximum 255 characters or null' });
        return;
      }
      updateData.seo_keywords = seo_keywords?.trim() || null;
    }

    // Validate slug uniqueness if updating
    if (slug) {
      const { data: existingPack, error: slugCheckError } = await supabase
        .from('credit_packs')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugCheckError && slugCheckError.code !== 'PGRST116') {
        console.error('Error checking slug uniqueness:', slugCheckError);
        res.status(500).json({ error: 'Failed to validate slug uniqueness' });
        return;
      }

      if (existingPack) {
        res.status(409).json({ error: 'Credit pack with this slug already exists' });
        return;
      }
    }

    // Validate category_ids if provided and update relationships
    if (category_ids !== undefined) {
      if (!Array.isArray(category_ids)) {
        res.status(400).json({ error: 'Category IDs must be an array of UUID strings' });
        return;
      }

      // Check if categories exist
      if (category_ids.length > 0) {
        const { data: validCategories, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .in('id', category_ids);

        if (categoryError || !validCategories || validCategories.length !== category_ids.length) {
          res.status(400).json({ error: 'One or more category IDs are invalid' });
          return;
        }

        // Remove existing category relationships
        await supabase
          .from('credit_pack_categories')
          .delete()
          .eq('credit_pack_id', id);

        // Add new category relationships
        if (category_ids.length > 0) {
          const categoryInsertions = category_ids.map((categoryId: string) => ({
            credit_pack_id: id,
            category_id: categoryId
          }));

          const { error: categoryError } = await supabase
            .from('credit_pack_categories')
            .insert(categoryInsertions);

          if (categoryError) {
            console.error('Error updating category relationships:', categoryError);
            // Don't fail the entire update, but log the error
          }
        }
      }
    }

    // Update the credit pack
    const { data: creditPack, error: updateError } = await supabase
      .from('credit_packs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        credit_pack_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating credit pack:', updateError);
      if (updateError.code === 'PGRST116') {
        res.status(404).json({ error: 'Credit pack not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update credit pack' });
      return;
    }

    // Transform response to include categories properly
    const transformedPack = {
      ...creditPack,
      categories: creditPack.credit_pack_categories
        ?.map((cpc: any) => cpc.categories)
        .filter(Boolean) || [],
      credit_pack_categories: undefined
    };

    res.json(transformedPack);
  } catch (error) {
    console.error('Error in PATCH /admin/credit-packs/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/credit-packs/:id - Delete a credit pack (admin only)
router.delete('/:id', authenticateAdmin, validateUUIDParam('id'), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('credit_packs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting credit pack:', error);
      res.status(500).json({ error: 'Failed to delete credit pack' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /admin/credit-packs/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
