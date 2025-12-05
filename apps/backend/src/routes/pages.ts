import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { validateUUIDParam } from '../middleware/validation';

const router = Router();

// ===== PUBLIC ENDPOINTS =====

// GET /api/v1/pages/:slug - Get published page content by slug (public)
router.get('/:slug', async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;

    // Validate slug format (same as stored in DB)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slug || !slugRegex.test(slug) || slug.length < 3 || slug.length > 100) {
      res.status(400).json({ error: 'Invalid page slug format' });
      return;
    }

    const { data: page, error } = await supabase
      .from('pages')
      .select('id, slug, title, content, seo_title, seo_description, seo_keywords, created_at, updated_at')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching page:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Page not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch page' });
      return;
    }

    res.json(page);
  } catch (error) {
    console.error('Error in GET /pages/:slug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// GET /api/v1/admin/pages - Get all pages for admin management
router.get('/admin', authenticateAdmin, async (req, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

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

    // Build query
    let query = supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
    }

    const { data: pages, error } = await query;

    if (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Failed to fetch pages' });
      return;
    }

    // Get total count for pagination
    let countQuery = supabase.from('pages').select('*', { count: 'exact', head: true });

    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      countQuery = countQuery.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting pages:', countError);
      res.status(500).json({ error: 'Failed to count pages' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: pages,
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
    console.error('Error in GET /admin/pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/pages/:id - Get detailed page information by ID
router.get('/admin/:id', authenticateAdmin, validateUUIDParam('id'), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching page:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Page not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch page' });
      return;
    }

    res.json(page);
  } catch (error) {
    console.error('Error in GET /admin/pages/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/admin/pages - Create a new page
router.post('/admin', authenticateAdmin, async (req, res): Promise<void> => {
  try {
    const { title, slug, content, seo_title, seo_description, seo_keywords } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      res.status(400).json({ error: 'Title is required and must be a non-empty string' });
      return;
    }

    // Validate title length
    if (title.length > 200) {
      res.status(400).json({ error: 'Title must not exceed 200 characters' });
      return;
    }

    // Pre-process slug or auto-generate
    let validatedSlug = slug;
    if (!slug) {
      validatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .substring(0, 100);
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(validatedSlug) || validatedSlug.length < 3 || validatedSlug.length > 100) {
      res.status(400).json({
        error: 'Slug must be 3-100 characters, contain only lowercase letters, numbers, and hyphens'
      });
      return;
    }

    // Validate content (optional but if provided should be reasonable size)
    if (content && typeof content !== 'string') {
      res.status(400).json({ error: 'Content must be a string' });
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

    // Check slug uniqueness
    const { data: existingPage, error: slugCheckError } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', validatedSlug)
      .single();

    if (slugCheckError && slugCheckError.code !== 'PGRST116') {
      console.error('Error checking slug uniqueness:', slugCheckError);
      res.status(500).json({ error: 'Failed to validate slug uniqueness' });
      return;
    }

    if (existingPage) {
      res.status(409).json({ error: 'Page with this slug already exists' });
      return;
    }

    // Create the page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        title: title.trim(),
        slug: validatedSlug,
        content: content?.trim() || null,
        seo_title: seo_title?.trim() || null,
        seo_description: seo_description?.trim() || null,
        seo_keywords: seo_keywords?.trim() || null,
      })
      .select('*')
      .single();

    if (pageError) {
      console.error('Error creating page:', pageError);
      res.status(500).json({ error: 'Failed to create page' });
      return;
    }

    res.status(201).json(page);
  } catch (error) {
    console.error('Error in POST /admin/pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/pages/:id - Update a page
router.patch('/admin/:id', authenticateAdmin, validateUUIDParam('id'), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slug, content, seo_title, seo_description, seo_keywords } = req.body;

    // Build update object with validation for provided fields
    const updateData: any = {};

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 1) {
        res.status(400).json({ error: 'Title must be a non-empty string' });
        return;
      }
      if (title.length > 200) {
        res.status(400).json({ error: 'Title must not exceed 200 characters' });
        return;
      }
      updateData.title = title.trim();
    }

    // Validate slug if provided
    if (slug !== undefined) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 100) {
        res.status(400).json({
          error: 'Slug must be 3-100 characters, contain only lowercase letters, numbers, and hyphens'
        });
        return;
      }
      updateData.slug = slug;
    }

    // Validate content if provided
    if (content !== undefined) {
      if (content !== null && typeof content !== 'string') {
        res.status(400).json({ error: 'Content must be a string or null' });
        return;
      }
      updateData.content = content?.trim() || null;
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

    // Validate slug uniqueness if updating slug
    if (slug) {
      const { data: existingPage, error: slugCheckError } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugCheckError && slugCheckError.code !== 'PGRST116') {
        console.error('Error checking slug uniqueness:', slugCheckError);
        res.status(500).json({ error: 'Failed to validate slug uniqueness' });
        return;
      }

      if (existingPage) {
        res.status(409).json({ error: 'Page with this slug already exists' });
        return;
      }
    }

    // Update the page
    const { data: page, error: updateError } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating page:', updateError);
      if (updateError.code === 'PGRST116') {
        res.status(404).json({ error: 'Page not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update page' });
      return;
    }

    res.json(page);
  } catch (error) {
    console.error('Error in PATCH /admin/pages/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/pages/:id - Delete a page (removed DELETE endpoint as not requested)

export default router;
