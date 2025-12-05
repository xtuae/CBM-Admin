import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/orders - Get all orders for the authenticated user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        credit_packs (
          id,
          name,
          description,
          credit_amount,
          price_usd
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error in GET /orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/my/orders - Get all orders for the authenticated user
router.get('/my/orders', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          credit_packs (
            id,
            name,
            credit_amount,
            price_usd
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error in GET /my/orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/my/orders/:id - Get a specific order by ID (user's own order only)
router.get('/my/orders/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          credit_packs (
            id,
            name,
            credit_amount,
            price_usd
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch order' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error in GET /my/orders/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/orders/:id - Get a specific order by ID (user's own order only)
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        credit_packs (
          id,
          name,
          description,
          credit_amount,
          price_usd
        )
      `)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch order' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error in GET /orders/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/orders - Create a new order
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { credit_pack_id } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!credit_pack_id) {
      res.status(400).json({ error: 'credit_pack_id is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(credit_pack_id)) {
      res.status(400).json({ error: 'Invalid credit_pack_id format' });
      return;
    }

    // Validate that credit pack exists and is active
    const { data: creditPack, error: creditPackError } = await supabase
      .from('credit_packs')
      .select('id, name, price_usd')
      .eq('id', credit_pack_id)
      .eq('is_active', true)
      .single();

    if (creditPackError || !creditPack) {
      console.error('Error fetching credit pack:', creditPackError);
      res.status(400).json({ error: 'Invalid or inactive credit pack' });
      return;
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        credit_pack_id: credit_pack_id,
        status: 'pending',
        total_amount: creditPack.price_usd,
      })
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        created_at,
        credit_packs (
          id,
          name,
          description,
          credit_amount,
          price_usd
        )
      `)
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      res.status(500).json({ error: 'Failed to create order' });
      return;
    }

    // Create placeholder payment session data
    const paymentSession = {
      session_id: `session_${order.id}`,
      payment_url: `https://payment.example.com/pay/${order.id}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      amount: order.total_amount,
      currency: 'USD',
    };

    // Return order details with payment session
    const response = {
      order: {
        id: order.id,
        user_id: order.user_id,
        credit_pack: order.credit_packs,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
      },
      payment_session: paymentSession,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error in POST /orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
