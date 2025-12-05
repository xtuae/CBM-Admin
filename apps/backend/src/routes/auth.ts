import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/auth/me - Get authenticated user's profile
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      res.status(500).json({ error: 'Failed to fetch user profile' });
      return;
    }

    // Calculate credit balance by summing all amounts from credit_ledger
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('user_id', userId);

    if (ledgerError) {
      console.error('Error fetching credit ledger:', ledgerError);
      res.status(500).json({ error: 'Failed to calculate credit balance' });
      return;
    }

    const creditBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;

    // Return user profile with credit balance
    const userProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role: req.user!.role || 'user',
      credit_balance: creditBalance,
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
