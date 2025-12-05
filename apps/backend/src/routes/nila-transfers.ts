import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/nila-transfers - Get user's own nila transfers
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

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

    // Build query - users can only see their own transfers
    let query = supabase
      .from('nila_transfers')
      .select(`
        id,
        user_id,
        credits_used,
        nila_amount,
        network,
        wallet_address,
        transaction_hash,
        status,
        notes,
        created_at,
        updated_at,
        processed_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      const validStatuses = ['pending', 'processing', 'confirmed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Valid statuses: pending, processing, confirmed, failed, cancelled' });
        return;
      }
      query = query.eq('status', status);
    }

    const { data: transfers, error } = await query;

    if (error) {
      console.error('Error fetching nila transfers:', error);
      res.status(500).json({ error: 'Failed to fetch nila transfers' });
      return;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('nila_transfers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting nila transfers:', countError);
      res.status(500).json({ error: 'Failed to count nila transfers' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: transfers,
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
    console.error('Error in GET /nila-transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
