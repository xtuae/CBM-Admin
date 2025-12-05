import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/wishlist - Get user's wishlist items
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all wishlist items with credit pack details
    const { data: wishlistItems, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        credit_packs (
          id,
          name,
          slug,
          credit_amount,
          price_usd,
          is_featured,
          short_description,
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
      return;
    }

    // Transform the data to flatten the credit_packs relationship
    const transformedItems = wishlistItems?.map(item => ({
      id: item.id,
      created_at: item.created_at,
      credit_pack: item.credit_packs,
    })) || [];

    res.json(transformedItems);
  } catch (error) {
    console.error('Error in GET /wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/wishlist - Add item to wishlist
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { credit_pack_id } = req.body;

    // Validate input
    if (!credit_pack_id) {
      res.status(400).json({ error: 'credit_pack_id is required' });
      return;
    }

    // Check if the credit pack exists
    const { data: creditPack, error: packError } = await supabase
      .from('credit_packs')
      .select('id')
      .eq('id', credit_pack_id)
      .single();

    if (packError || !creditPack) {
      res.status(404).json({ error: 'Credit pack not found' });
      return;
    }

    // Check if item is already in wishlist
    const { data: existingItem, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('credit_pack_id', credit_pack_id)
      .single();

    if (existingItem) {
      res.status(409).json({ error: 'Item already in wishlist' });
      return;
    }

    // Add item to wishlist
    const { data: wishlistItem, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        credit_pack_id: credit_pack_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Failed to add item to wishlist' });
      return;
    }

    res.status(201).json({
      id: wishlistItem.id,
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    console.error('Error in POST /wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/wishlist/:credit_pack_id - Remove item from wishlist
router.delete('/:credit_pack_id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { credit_pack_id } = req.params;

    if (!credit_pack_id) {
      res.status(400).json({ error: 'credit_pack_id is required' });
      return;
    }

    // Remove item from wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('credit_pack_id', credit_pack_id)
      .select();

    if (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Failed to remove item from wishlist' });
      return;
    }

    if (!data || data.length === 0) {
      res.status(404).json({ error: 'Item not found in wishlist' });
      return;
    }

    res.json({
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /wishlist/:credit_pack_id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/wishlist/:credit_pack_id - Check if item is in wishlist
router.get('/:credit_pack_id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { credit_pack_id } = req.params;

    if (!credit_pack_id) {
      res.status(400).json({ error: 'credit_pack_id is required' });
      return;
    }

    // Check if item is in wishlist
    const { data: wishlistItem, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('credit_pack_id', credit_pack_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking wishlist:', error);
      res.status(500).json({ error: 'Failed to check wishlist status' });
      return;
    }

    res.json({
      in_wishlist: !!wishlistItem,
      wishlist_item_id: wishlistItem?.id || null
    });
  } catch (error) {
    console.error('Error in GET /wishlist/:credit_pack_id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
