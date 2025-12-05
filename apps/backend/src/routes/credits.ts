import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/credits - Get user's credit information
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all credit ledger entries for the user
    const { data: ledgerEntries, error } = await supabase
      .from('credit_ledger')
      .select('amount, transaction_type')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching credit ledger:', error);
      res.status(500).json({ error: 'Failed to fetch credit information' });
      return;
    }

    // Calculate credit balance (sum of all amounts)
    const creditBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;

    // Calculate total purchased (sum of credit_purchase amounts)
    const totalPurchased = ledgerEntries
      ?.filter(entry => entry.transaction_type === 'credit_purchase')
      .reduce((total, entry) => total + entry.amount, 0) || 0;

    // Calculate total converted (absolute value of settlement_used amounts)
    const totalConverted = Math.abs(
      ledgerEntries
        ?.filter(entry => entry.transaction_type === 'settlement_used')
        .reduce((total, entry) => total + entry.amount, 0) || 0
    );

    res.json({
      credit_balance: creditBalance,
      total_purchased: totalPurchased,
      total_converted: totalConverted,
    });
  } catch (error) {
    console.error('Error in GET /credits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/credits/ledger - Get user's credit ledger with pagination
router.get('/ledger', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
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

    // Get total count for pagination metadata
    const { count: totalCount, error: countError } = await supabase
      .from('credit_ledger')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting ledger entries:', countError);
      res.status(500).json({ error: 'Failed to fetch ledger count' });
      return;
    }

    // Get paginated ledger entries
    const { data: ledgerEntries, error } = await supabase
      .from('credit_ledger')
      .select(`
        id,
        user_id,
        order_id,
        transaction_type,
        amount,
        balance_after,
        description,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching credit ledger:', error);
      res.status(500).json({ error: 'Failed to fetch credit ledger' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: ledgerEntries,
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
    console.error('Error in GET /credits/ledger:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
