import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { sendOrderConfirmationEmail, sendTestEmail, checkEmailService } from '../lib/email';

const router = Router();

// POST /api/v1/webhooks/payments - Handle payment webhooks
router.post('/payments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id, payment_id, status, amount, currency } = req.body;

    // Mock webhook signature verification (since gateway not finalized)
    const signature = req.headers['x-webhook-signature'] as string;
    if (!signature) {
      console.error('Missing webhook signature');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Mock signature verification - in production, verify against payment gateway's signature
    const expectedSignature = 'mock-signature'; // Replace with actual verification logic
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!order_id || !payment_id || !status) {
      console.error('Missing required webhook data:', { order_id, payment_id, status });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Only process successful payments
    if (status !== 'paid' && status !== 'completed') {
      console.log(`Ignoring webhook for order ${order_id} with status: ${status}`);
      res.status(200).json({ received: true });
      return;
    }

    // Validate UUID format for order_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(order_id)) {
      console.error('Invalid order_id format:', order_id);
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }

    // Get order details with credit pack info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Get credit pack details
    const { data: creditPack, error: creditPackError } = await supabase
      .from('credit_packs')
      .select('name, credit_amount')
      .eq('id', order.credit_pack_id)
      .single();

    if (creditPackError || !creditPack) {
      console.error('Credit pack not found:', creditPackError);
      res.status(500).json({ error: 'Credit pack information not found' });
      return;
    }

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check if order is already paid
    if (order.status === 'paid') {
      console.log(`Order ${order_id} already marked as paid`);
      res.status(200).json({ received: true });
      return;
    }

    // Verify payment amount matches order total
    if (amount && parseFloat(amount) !== order.total_amount) {
      console.error(`Payment amount mismatch for order ${order_id}: expected ${order.total_amount}, got ${amount}`);
      res.status(400).json({ error: 'Payment amount mismatch' });
      return;
    }

    // Start transaction-like operations
    // Note: Supabase doesn't support traditional transactions, so we'll handle this sequentially

    // 1. Update order status to paid and add payment_id
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: payment_id,
        payment_gateway: 'mock-gateway', // Replace with actual gateway
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateOrderError) {
      console.error('Error updating order:', updateOrderError);
      res.status(500).json({ error: 'Failed to update order' });
      return;
    }

    // 2. Calculate current credit balance for the user
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('user_id', order.user_id);

    if (ledgerError) {
      console.error('Error fetching credit ledger:', ledgerError);
      res.status(500).json({ error: 'Failed to calculate credit balance' });
      return;
    }

    const currentBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;
    const creditAmount = creditPack.credit_amount;
    const newBalance = currentBalance + creditAmount;

    // 3. Insert credit ledger entry
    const { error: ledgerInsertError } = await supabase
      .from('credit_ledger')
      .insert({
        user_id: order.user_id,
        order_id: order_id,
        transaction_type: 'credit_purchase',
        amount: creditAmount,
        balance_after: newBalance,
        description: `Credit purchase - ${creditPack.name}`,
      });

    if (ledgerInsertError) {
      console.error('Error inserting credit ledger entry:', ledgerInsertError);
      res.status(500).json({ error: 'Failed to update credit balance' });
      return;
    }

    // 4. Send order confirmation email to user
    try {
      // Get user information for the email
      const { data: userProfile, error: userError } = await supabase.auth.admin.getUserById(order.user_id);

      if (!userError && userProfile?.user?.email) {
        const userEmail = userProfile.user.email;
        const userName = userProfile.user.user_metadata?.first_name || null;

        // Send order confirmation email
        const emailSent = await sendOrderConfirmationEmail(userEmail, userName, {
          orderId: order_id,
          creditsAdded: creditAmount,
          amount: order.total_amount,
          currency: currency || 'USD',
          orderDate: new Date().toISOString(),
        });

        if (emailSent) {
          console.log(`Order confirmation email sent to ${userEmail} for order ${order_id}`);
        } else {
          console.warn(`Failed to send order confirmation email for order ${order_id}`);
        }
      } else {
        console.warn(`Could not send email - user profile not found or no email for user ${order.user_id}`);
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the webhook if email fails - payment processing succeeded
    }

    console.log(`Successfully processed payment for order ${order_id}: added ${creditAmount} credits to user ${order.user_id}`);
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error in payment webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/webhooks/test-email - Test email functionality (development only)
router.post('/test-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Send test email
    const emailSent = await sendTestEmail(email);

    if (emailSent) {
      console.log(`Test email sent successfully to ${email}`);
      res.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Failed to send test email');
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check your email configuration.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/webhooks/test-email - Check email service status
router.get('/test-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const emailConfigured = await checkEmailService();

    res.json({
      configured: emailConfigured,
      settings: {
        has_host: !!process.env.EMAIL_SMTP_HOST,
        has_user: !!process.env.EMAIL_SMTP_USER,
        has_pass: !!process.env.EMAIL_SMTP_PASS,
        from: process.env.EMAIL_FROM || 'noreply@credits-marketplace.com',
        from_name: process.env.EMAIL_FROM_NAME || 'Credits Marketplace',
        port: process.env.EMAIL_SMTP_PORT || '587',
        secure: process.env.EMAIL_SMTP_SECURE === 'true' ? 'yes' : 'no'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking email service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
