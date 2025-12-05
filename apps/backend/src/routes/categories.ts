import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/categories - Get all active categories
router.get('/', async (req, res): Promise<void> => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

    res.json(categories);
  } catch (error) {
    console.error('Error in GET /categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// GET /api/v1/admin/categories - Get all categories (admin view)
router.get('/admin', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

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

    // Get all categories with full details
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting categories:', countError);
      res.status(500).json({ error: 'Failed to count categories' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: categories,
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
    console.error('Error in GET /admin/categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/admin/categories - Create a new category
router.post('/admin', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { name, slug, description, icon_url, seo_title, seo_description, seo_keywords } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required and must be a non-empty string' });
      return;
    }

    // Validate slug format (if provided, otherwise auto-generate)
    let validatedSlug = slug;
    if (!validatedSlug) {
      // Auto-generate slug from name
      validatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/[\s-]+/g, '-') // Replace spaces and multiple dashes with single dash
        .substring(0, 100); // Limit length
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(validatedSlug) || validatedSlug.length < 3 || validatedSlug.length > 100) {
      res.status(400).json({
        error: 'Slug must be 3-100 characters, contain only lowercase letters, numbers, and hyphens'
      });
      return;
    }

    // Validate optional fields
    if (description && (typeof description !== 'string' || description.length > 500)) {
      res.status(400).json({ error: 'Description must be a string with maximum 500 characters' });
      return;
    }

    if (icon_url && (typeof icon_url !== 'string' || icon_url.length > 500)) {
      res.status(400).json({ error: 'Icon URL must be a valid string with maximum 500 characters' });
      return;
    }

    if (icon_url && !/^https?:\/\/.+/.test(icon_url)) {
      res.status(400).json({ error: 'Icon URL must be a valid HTTP or HTTPS URL' });
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

    // Check for slug uniqueness
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', validatedSlug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking slug uniqueness:', checkError);
      res.status(500).json({ error: 'Failed to validate slug uniqueness' });
      return;
    }

    if (existingCategory) {
      res.status(409).json({ error: 'Category with this slug already exists' });
      return;
    }

    // Create the category
    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug: validatedSlug,
        description: description?.trim() || null,
        icon_url: icon_url?.trim() || null,
        seo_title: seo_title?.trim() || null,
        seo_description: seo_description?.trim() || null,
        seo_keywords: seo_keywords?.trim() || null,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating category:', insertError);
      res.status(500).json({ error: 'Failed to create category' });
      return;
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('Error in POST /admin/categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/categories/:id - Update category
router.patch('/admin/:id', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_url, seo_title, seo_description, seo_keywords } = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      res.status(400).json({ error: 'Valid category ID is required' });
      return;
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1) {
        res.status(400).json({ error: 'Name must be a non-empty string' });
        return;
      }
      updateData.name = name.trim();
    }

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

    if (description !== undefined) {
      if (description !== null && (typeof description !== 'string' || description.length > 500)) {
        res.status(400).json({ error: 'Description must be a string with maximum 500 characters or null' });
        return;
      }
      updateData.description = description?.trim() || null;
    }

    if (icon_url !== undefined) {
      if (icon_url !== null && (typeof icon_url !== 'string' || icon_url.length > 500)) {
        res.status(400).json({ error: 'Icon URL must be a valid string with maximum 500 characters or null' });
        return;
      }
      if (icon_url && !/^https?:\/\/.+/.test(icon_url)) {
        res.status(400).json({ error: 'Icon URL must be a valid HTTP or HTTPS URL' });
        return;
      }
      updateData.icon_url = icon_url?.trim() || null;
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

    // Check slug uniqueness if updating slug
    if (slug) {
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking slug uniqueness:', checkError);
        res.status(500).json({ error: 'Failed to validate slug uniqueness' });
        return;
      }

      if (existingCategory) {
        res.status(409).json({ error: 'Category with this slug already exists' });
        return;
      }
    }

    // Update the category
    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating category:', updateError);
      if (updateError.code === 'PGRST116') {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update category' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Error in PATCH /admin/categories/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/categories/:id - Delete category
router.delete('/admin/:id', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      res.status(400).json({ error: 'Valid category ID is required' });
      return;
    }

    // Check if category exists and get related credit pack count
    const { data: categoryData, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching category:', fetchError);
      if (fetchError.code === 'PGRST116') {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch category' });
      return;
    }

    // Check if category has related credit pack categories
    const { data: relatedPacks, error: countError } = await supabase
      .from('credit_pack_categories')
      .select('id', { count: 'exact' })
      .eq('category_id', id);

    if (countError) {
      console.error('Error checking related credit packs:', countError);
      res.status(500).json({ error: 'Failed to check category usage' });
      return;
    }

    if (relatedPacks && relatedPacks.length > 0) {
      res.status(409).json({
        error: 'Cannot delete category that is assigned to credit packs',
        related_packs_count: relatedPacks.length
      });
      return;
    }

    // Delete the category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting category:', deleteError);
      res.status(500).json({ error: 'Failed to delete category' });
      return;
    }

    res.json({
      message: 'Category deleted successfully',
      deleted_category: categoryData
    });
  } catch (error) {
    console.error('Error in DELETE /admin/categories/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
