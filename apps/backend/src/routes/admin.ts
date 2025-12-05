import { Router } from 'express';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import {
  validateUUIDParam,
  validatePositiveAmount,
  validatePositiveInteger,
  validateWalletAddress,
  validateSettlementTransition,
  validateNoNegativeBalance
} from '../middleware/validation';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
  PaymentError,
  logSettlementActivity,
  logPaymentActivity,
  logAdminActivity
} from '../lib/errorHandler';

const router = Router();

// GET /api/v1/admin/users - Get all users with profile, credit balance, recent orders, and wallet addresses
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
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

    // Get users with their profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting users:', countError);
      res.status(500).json({ error: 'Failed to count users' });
      return;
    }

    // Enrich users with additional data
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get credit balance
        const { data: ledgerEntries } = await supabase
          .from('credit_ledger')
          .select('amount')
          .eq('user_id', user.id);

        const creditBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;

        // Get recent orders (last 5)
        const { data: recentOrders } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            created_at,
            credit_packs (
              name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get wallet addresses
        const { data: walletAddresses } = await supabase
          .from('wallet_addresses')
          .select('id, network, address, label, is_primary, is_verified')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        return {
          ...user,
          credit_balance: creditBalance,
          recent_orders: recentOrders || [],
          wallet_addresses: walletAddresses || [],
        };
      })
    );

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: enrichedUsers,
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
    console.error('Error in GET /admin/users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/users/:id - Get detailed user information
router.get('/users/:id', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get credit balance and transaction summary
    const { data: ledgerEntries } = await supabase
      .from('credit_ledger')
      .select('amount, transaction_type')
      .eq('user_id', id);

    const creditBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;
    const totalPurchased = ledgerEntries
      ?.filter(entry => entry.transaction_type === 'credit_purchase')
      .reduce((total, entry) => total + entry.amount, 0) || 0;
    const totalConverted = Math.abs(
      ledgerEntries
        ?.filter(entry => entry.transaction_type === 'settlement_used')
        .reduce((total, entry) => total + entry.amount, 0) || 0
    );

    // Get all orders with credit pack details
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        updated_at,
        credit_packs (
          id,
          name,
          credit_amount,
          price_usd
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get all wallet addresses
    const { data: walletAddresses } = await supabase
      .from('wallet_addresses')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get NILA transfers
    const { data: nilaTransfers } = await supabase
      .from('nila_transfers')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Get recent credit ledger entries (last 10)
    const { data: recentLedgerEntries } = await supabase
      .from('credit_ledger')
      .select(`
        id,
        transaction_type,
        amount,
        balance_after,
        description,
        created_at
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    const userDetails = {
      ...user,
      credit_summary: {
        balance: creditBalance,
        total_purchased: totalPurchased,
        total_converted: totalConverted,
      },
      orders: orders || [],
      wallet_addresses: walletAddresses || [],
      nila_transfers: nilaTransfers || [],
      recent_ledger_entries: recentLedgerEntries || [],
    };

    res.json(userDetails);
  } catch (error) {
    console.error('Error in GET /admin/users/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/nila-transfers - Get all nila transfers (admin view)
router.get('/nila-transfers', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
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

    // Build query
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
        processed_by,
        notes,
        created_at,
        updated_at,
        processed_at,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
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
      .select('*', { count: 'exact', head: true });

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
    console.error('Error in GET /admin/nila-transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/admin/nila-transfers - Create a new nila transfer
router.post(
  '/nila-transfers',
  authenticateAdmin,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const { user_id, credits_used, nila_amount, network, wallet_address, notes } = req.body;

      // Validate that user_id is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user_id)) {
        res.status(400).json({ error: 'user_id must be a valid UUID' });
        return;
      }

      const creditsValidation = validatePositiveAmount(credits_used, 1, 100000);
      if (!creditsValidation.isValid) {
        res.status(400).json({ error: `Credits: ${creditsValidation.errors.join(', ')}` });
        return;
      }

      const nilaValidation = validatePositiveAmount(nila_amount, 0.01, 10000);
      if (!nilaValidation.isValid) {
        res.status(400).json({ error: `NILA amount: ${nilaValidation.errors.join(', ')}` });
        return;
      }

      const walletValidation = validateWalletAddress(wallet_address, network);
      if (!walletValidation.isValid) {
        res.status(400).json({ error: walletValidation.errors.join(', ') });
        return;
      }

      // Sanitized inputs
      const sanitizedUserId = user_id;
      const sanitizedCredits = creditsValidation.sanitizedData;
      const sanitizedNila = nilaValidation.sanitizedData;
      const sanitizedWallet = walletValidation.sanitizedData;

      // Validate network again (should be redundant but for safety)
      const validNetworks = ['polygon', 'ethereum', 'solana'];
      if (!validNetworks.includes(network.toLowerCase())) {
        res.status(400).json({ error: 'Invalid network. Supported networks: polygon, ethereum, solana' });
        return;
      }

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', sanitizedUserId)
      .single();

    if (userError || !user) {
      await logSettlementActivity(sanitizedUserId, '', 'SETTLEMENT_FAILED_USER_NOT_FOUND', {
        adminId,
        credits_used: sanitizedCredits,
        nila_amount: sanitizedNila,
      });
      throw new NotFoundError('User not found');
    }

    // Check balance and prevent negative balances
    const balanceCheck = await validateNoNegativeBalance(sanitizedUserId, sanitizedCredits, supabase);
    if (!balanceCheck.isValid) {
      await logSettlementActivity(sanitizedUserId, '', 'SETTLEMENT_FAILED_INSUFFICIENT_BALANCE', {
        adminId,
        requested_credits: sanitizedCredits,
        current_balance: balanceCheck.sanitizedData?.currentBalance || 0,
      });
      throw new ValidationError('Insufficient credit balance', balanceCheck.errors[0]);
    }

    const currentBalance = balanceCheck.sanitizedData!.currentBalance;
    const newBalance = balanceCheck.sanitizedData!.newBalance;

    // Log settlement initiation
    await logSettlementActivity(sanitizedUserId, '', 'SETTLEMENT_INITIATED', {
      adminId,
      credits_used: sanitizedCredits,
      nila_amount: sanitizedNila,
      network,
      wallet_address: sanitizedWallet,
    });

    try {
      // Start transaction-like operations
      // Note: Supabase doesn't support traditional transactions, so we'll handle this sequentially

      // 1. Insert credit ledger entry for the deduction
      const { error: ledgerInsertError } = await supabase
        .from('credit_ledger')
        .insert({
          user_id: sanitizedUserId,
          transaction_type: 'settlement_used',
          amount: -sanitizedCredits, // Negative amount for deduction
          balance_after: newBalance,
          description: `NILA transfer - ${sanitizedNila} $NILA to ${sanitizedWallet}`,
        });

      if (ledgerInsertError) {
        console.error('Error inserting credit ledger entry:', ledgerInsertError);
        await logSettlementActivity(sanitizedUserId, '', 'SETTLEMENT_FAILED_LEDGER_ERROR', {
          adminId,
          error: ledgerInsertError.message,
        });
        throw new PaymentError('Failed to deduct credits from ledger', { ledgerError: ledgerInsertError });
      }

      // 2. Insert nila transfer record
      const { data: transfer, error: transferError } = await supabase
        .from('nila_transfers')
        .insert({
          user_id: sanitizedUserId,
          credits_used: sanitizedCredits,
          nila_amount: sanitizedNila,
          network: network.toLowerCase(),
          wallet_address: sanitizedWallet,
          status: 'pending',
          processed_by: adminId,
          notes: notes || null,
          processed_at: new Date().toISOString(),
        })
        .select(`
          id,
          user_id,
          credits_used,
          nila_amount,
          network,
          wallet_address,
          transaction_hash,
          status,
          processed_by,
          notes,
          created_at,
          updated_at,
          processed_at,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .single();

      if (transferError) {
        console.error('Error creating nila transfer:', transferError);
        await logSettlementActivity(sanitizedUserId, '', 'SETTLEMENT_FAILED_TRANSFER_ERROR', {
          adminId,
          error: transferError.message,
        });
        throw new PaymentError('Failed to create settlement record', { transferError: transferError });
      }

      // Log successful settlement creation
      await logSettlementActivity(sanitizedUserId, transfer.id, 'SETTLEMENT_CREATED', {
        adminId,
        credits_used: sanitizedCredits,
        nila_amount: sanitizedNila,
        network,
        wallet_address: sanitizedWallet,
        balance_after: newBalance,
      });

      res.status(201).json({
        transfer: transfer,
        credit_balance_before: currentBalance,
        credit_balance_after: newBalance,
      });

    } catch (error) {
      // If there was a database error after inserting ledger entry,
      // we should ideally rollback, but Supabase doesn't support rollbacks
      console.error('Settlement creation failed:', error);
      throw error; // Let the global error handler deal with it
    }
  } catch (error) {
    console.error('Error in POST /admin/nila-transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/nila-transfers/:id - Update nila transfer
router.patch('/nila-transfers/:id',
  authenticateAdmin,
  validateUUIDParam('id'),
  validateSettlementTransition,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { status, transaction_hash, notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (transaction_hash) updateData.transaction_hash = transaction_hash;
    if (notes !== undefined) updateData.notes = notes;

    // Add processed_at timestamp if status is being updated to a final state
    if (status && ['confirmed', 'failed', 'cancelled'].includes(status)) {
      updateData.processed_at = new Date().toISOString();
      updateData.processed_by = adminId;
    }

    const { data: transfer, error } = await supabase
      .from('nila_transfers')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        user_id,
        credits_used,
        nila_amount,
        network,
        wallet_address,
        transaction_hash,
        status,
        processed_by,
        notes,
        created_at,
        updated_at,
        processed_at,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating nila transfer:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Nila transfer not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update nila transfer' });
      return;
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error in PATCH /admin/nila-transfers/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/analytics - Get analytics overview data
router.get('/analytics', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get total number of users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error counting users:', usersError);
      throw usersError;
    }

    // Get total credits purchased (sum from ledger where type='credit_purchase')
    const { data: creditLedger, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('transaction_type', 'credit_purchase');

    if (ledgerError) {
      console.error('Error fetching credit ledger:', ledgerError);
      throw ledgerError;
    }

    const totalCreditsPurchased = creditLedger?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    // Get total orders and orders in last 7/30 days
    const { count: totalOrders, error: totalOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalOrdersError) {
      console.error('Error counting total orders:', totalOrdersError);
      throw totalOrdersError;
    }

    const { count: ordersLast7Days, error: orders7DaysError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    if (orders7DaysError) {
      console.error('Error counting orders last 7 days:', orders7DaysError);
      throw orders7DaysError;
    }

    const { count: ordersLast30Days, error: orders30DaysError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    if (orders30DaysError) {
      console.error('Error counting orders last 30 days:', orders30DaysError);
      throw orders30DaysError;
    }

    // Get top 5 selling products (by total credits purchased)
    // We need to join orders with credit_packs and sum the credits
    const { data: topProductsData, error: topProductsError } = await supabase
      .from('orders')
      .select(`
        credit_pack_id,
        credit_amount,
        credit_packs (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'completed'); // Only completed orders

    if (topProductsError) {
      console.error('Error fetching top products data:', topProductsError);
      throw topProductsError;
    }

    // Aggregate by credit_pack_id to find top sellers
    const productStats = new Map<string, { name: string; slug: string; totalCredits: number; orderCount: number }>();

    topProductsData?.forEach(order => {
      if (order.credit_packs && Array.isArray(order.credit_packs)) {
        const packId = order.credit_pack_id;

        // Since it's a one-to-one relationship, take the first item
        const pack = order.credit_packs[0];
        if (pack) {
          if (!productStats.has(packId)) {
            productStats.set(packId, {
              name: pack.name,
              slug: pack.slug,
              totalCredits: 0,
              orderCount: 0
            });
          }

          const stats = productStats.get(packId)!;
          stats.totalCredits += order.credit_amount;
          stats.orderCount += 1;
        }
      }
    });

    // Convert to array and sort by total credits descending
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalCredits - a.totalCredits)
      .slice(0, 5);

    const analytics = {
      total_users: totalUsers || 0,
      total_credits_purchased: totalCreditsPurchased,
      orders: {
        total: totalOrders || 0,
        last_7_days: ordersLast7Days || 0,
        last_30_days: ordersLast30Days || 0,
      },
      top_products: topProducts
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error in GET /admin/analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
// GET /api/v1/admin/activity-logs - Get admin activity logs with filtering
router.get('/activity-logs', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const adminUserId = req.query.admin_user_id as string;
    const actionType = req.query.action_type as string;
    const entityType = req.query.entity_type as string;
    const dateFrom = req.query.date_from as string;
    const dateTo = req.query.date_to as string;

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

    // Build query with joins and filters
    let query = supabase
      .from('admin_activity_log')
      .select(`
        id,
        admin_user_id,
        action_type,
        entity_type,
        entity_id,
        metadata,
        old_values,
        new_values,
        created_at,
        profiles:admin_user_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (adminUserId) {
      query = query.eq('admin_user_id', adminUserId);
    }
    if (actionType) {
      query = query.eq('action_type', actionType);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
      return;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('admin_activity_log')
      .select('*', { count: 'exact', head: true });

    if (adminUserId) {
      countQuery = countQuery.eq('admin_user_id', adminUserId);
    }
    if (actionType) {
      countQuery = countQuery.eq('action_type', actionType);
    }
    if (entityType) {
      countQuery = countQuery.eq('entity_type', entityType);
    }
    if (dateFrom) {
      countQuery = countQuery.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
      countQuery = countQuery.lte('created_at', `${dateTo}T23:59:59.999Z`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting activity logs:', countError);
      res.status(500).json({ error: 'Failed to count activity logs' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: activities || [],
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
    console.error('Error in GET /admin/activity-logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// GET /api/v1/admin/categories - Admin: Get all categories for management
router.get('/categories', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page < 1) {
      res.status(400).json({ error: 'Page must be 1 or greater' });
      return;
    }
    if (limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Limit must be between 1 and 100' });
      return;
    }

    const offset = (page - 1) * limit;

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

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
      data: categories || [],
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

// POST /api/v1/admin/categories - Admin: Create new category
router.post('/categories', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { name, slug, description, icon_url, seo_title, seo_description, seo_keywords } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug: slug?.trim() || null,
        description: description?.trim() || null,
        icon_url: icon_url?.trim() || null,
        seo_title: seo_title?.trim() || null,
        seo_description: seo_description?.trim() || null,
        seo_keywords: seo_keywords?.trim() || null,
      })
      .select()
      .single();

    if (categoryError) {
      console.error('Error creating category:', categoryError);
      res.status(500).json({ error: 'Failed to create category' });
      return;
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('Error in POST /admin/categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/categories/:id - Admin: Update category
router.patch('/categories/:id', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_url, seo_title, seo_description, seo_keywords } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Category ID is required' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (icon_url !== undefined) updateData.icon_url = icon_url.trim();
    if (seo_title !== undefined) updateData.seo_title = seo_title.trim();
    if (seo_description !== undefined) updateData.seo_description = seo_description.trim();
    if (seo_keywords !== undefined) updateData.seo_keywords = seo_keywords.trim();

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (categoryError) {
      console.error('Error updating category:', categoryError);
      if (categoryError.code === 'PGRST116') {
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

// DELETE /api/v1/admin/categories/:id - Admin: Delete category
router.delete('/categories/:id', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Category ID is required' });
      return;
    }

    const { error: categoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (categoryError) {
      console.error('Error deleting category:', categoryError);
      if (categoryError.code === 'PGRST116') {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to delete category' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /admin/categories/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/admin/pages - Admin: Get all pages for management
router.get('/pages', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    if (page < 1) {
      res.status(400).json({ error: 'Page must be 1 or greater' });
      return;
    }
    if (limit < 1 || limit > 500) {
      res.status(400).json({ error: 'Limit must be between 1 and 500' });
      return;
    }

    const offset = (page - 1) * limit;

    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      res.status(500).json({ error: 'Failed to fetch pages' });
      return;
    }

    const { count: totalCount, error: countError } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting pages:', countError);
      res.status(500).json({ error: 'Failed to count pages' });
      return;
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      data: pages || [],
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

// GET /api/v1/admin/overview - Alias for analytics (backward compatibility)
router.get('/overview', authenticateAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { data: creditLedger } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('transaction_type', 'credit_purchase');

    const totalCreditsPurchased = creditLedger?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: ordersLast7Days } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    const { count: ordersLast30Days } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    const { data: topProductsData } = await supabase
      .from('orders')
      .select(`
        credit_pack_id,
        credit_amount,
        credit_packs (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'completed');

    const productStats = new Map<string, { name: string; slug: string; totalCredits: number; orderCount: number }>();

    topProductsData?.forEach(order => {
      if (order.credit_packs && Array.isArray(order.credit_packs)) {
        const packId = order.credit_pack_id;
        const pack = order.credit_packs[0];
        if (pack) {
          if (!productStats.has(packId)) {
            productStats.set(packId, {
              name: pack.name,
              slug: pack.slug,
              totalCredits: 0,
              orderCount: 0
            });
          }

          const stats = productStats.get(packId)!;
          stats.totalCredits += order.credit_amount;
          stats.orderCount += 1;
        }
      }
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalCredits - a.totalCredits)
      .slice(0, 5);

    const analytics = {
      totalUsers: totalUsers || 0,
      totalCreditsPurchased,
      totalOrders: totalOrders || 0,
      ordersLast30Days: ordersLast30Days || 0,
      topProducts
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error in GET /admin/overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

});

export default router;
