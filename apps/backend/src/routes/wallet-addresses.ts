import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/wallet-addresses - Get all wallet addresses for the authenticated user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: walletAddresses, error } = await supabase
      .from('wallet_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wallet addresses:', error);
      res.status(500).json({ error: 'Failed to fetch wallet addresses' });
      return;
    }

    res.json(walletAddresses);
  } catch (error) {
    console.error('Error in GET /wallet-addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/wallet-addresses - Create a new wallet address
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { network, address, label, is_primary } = req.body;

    // Validate required fields
    if (!network || !address) {
      res.status(400).json({ error: 'Network and address are required' });
      return;
    }

    // Validate network (basic validation - could be expanded)
    const validNetworks = ['polygon', 'ethereum', 'solana', 'bitcoin'];
    if (!validNetworks.includes(network.toLowerCase())) {
      res.status(400).json({ error: 'Invalid network. Supported networks: polygon, ethereum, solana, bitcoin' });
      return;
    }

    // Basic address format validation (simplified - in production, use proper validation libraries)
    if (address.length < 20 || address.length > 100) {
      res.status(400).json({ error: 'Invalid address format' });
      return;
    }

    // If setting as primary, ensure no other primary wallet exists for this network
    if (is_primary) {
      const { error: updateError } = await supabase
        .from('wallet_addresses')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('network', network.toLowerCase())
        .eq('is_primary', true);

      if (updateError) {
        console.error('Error updating existing primary wallets:', updateError);
        res.status(500).json({ error: 'Failed to update existing primary wallet' });
        return;
      }
    }

    const { data: walletAddress, error } = await supabase
      .from('wallet_addresses')
      .insert({
        user_id: userId,
        network: network.toLowerCase(),
        address: address.toLowerCase(), // Normalize to lowercase
        label,
        is_primary: is_primary || false,
        is_verified: false, // New addresses start as unverified
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet address:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: 'Wallet address already exists' });
        return;
      }
      if (error.message.includes('one_primary_per_network')) {
        res.status(409).json({ error: 'A primary wallet already exists for this network' });
        return;
      }
      res.status(500).json({ error: 'Failed to create wallet address' });
      return;
    }

    res.status(201).json(walletAddress);
  } catch (error) {
    console.error('Error in POST /wallet-addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/wallet-addresses/:id - Update a wallet address
router.patch('/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { label, is_primary } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Wallet address ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid wallet address ID format' });
      return;
    }

    // Get current wallet to check ownership and network
    const { data: currentWallet, error: fetchError } = await supabase
      .from('wallet_addresses')
      .select('network, is_primary')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentWallet) {
      console.error('Wallet not found or access denied:', fetchError);
      res.status(404).json({ error: 'Wallet address not found' });
      return;
    }

    // If setting as primary, ensure no other primary wallet exists for this network
    if (is_primary && !currentWallet.is_primary) {
      const { error: updateError } = await supabase
        .from('wallet_addresses')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('network', currentWallet.network)
        .eq('is_primary', true);

      if (updateError) {
        console.error('Error updating existing primary wallets:', updateError);
        res.status(500).json({ error: 'Failed to update existing primary wallet' });
        return;
      }
    }

    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (is_primary !== undefined) updateData.is_primary = is_primary;

    const { data: walletAddress, error } = await supabase
      .from('wallet_addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating wallet address:', error);
      if (error.message.includes('one_primary_per_network')) {
        res.status(409).json({ error: 'A primary wallet already exists for this network' });
        return;
      }
      res.status(500).json({ error: 'Failed to update wallet address' });
      return;
    }

    res.json(walletAddress);
  } catch (error) {
    console.error('Error in PATCH /wallet-addresses/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/wallet-addresses/:id - Delete a wallet address
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({ error: 'Wallet address ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid wallet address ID format' });
      return;
    }

    const { error } = await supabase
      .from('wallet_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting wallet address:', error);
      res.status(500).json({ error: 'Failed to delete wallet address' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /wallet-addresses/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
