/**
 * Supabase Edge Function: payments-webhook
 *
 * Handles payment provider webhooks to confirm order payments and credit users.
 *
 * Payment Provider Setup:
 * 1. Deploy this Edge Function to Supabase
 * 2. Get the function URL: https://<project-ref>.supabase.co/functions/v1/payments-webhook
 * 3. Configure your payment provider webhook settings:
 *
 * For Stripe:
 * - Webhook URL: https://<project-ref>.supabase.co/functions/v1/payments-webhook
 * - Events: payment_intent.succeeded, payment_intent.payment_failed
 * - TODO: Add webhook secret to environment variables (SUPABASE_STRIPE_WEBHOOK_SECRET)
 *
 * For other providers (PayPal, etc.):
 * - TODO: Implement provider-specific signature validation
 * - TODO: Configure provider webhook secret in environment variables
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

console.log("Payments webhook handler loaded")

interface WebhookPayload {
  // Common webhook structure - adapt based on payment provider
  id: string
  object: string
  data: {
    object: {
      id: string
      metadata?: {
        order_id?: string
      }
    }
  }
  type: string
}

serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Get the raw request body for signature validation
    const rawBody = await req.text()
    const payload: WebhookPayload = JSON.parse(rawBody)

    console.log('Webhook received:', {
      type: payload.type,
      id: payload.id,
      eventObjectId: payload.data?.object?.id,
      metadata: payload.data?.object?.metadata
    })

    // TODO: Validate webhook signature based on payment provider
    // For Stripe, this would involve creating a signature from the raw body
    // and comparing it with the X-Stripe-Signature header
    /*
    const stripeSignature = req.headers.get('stripe-signature')
    if (!stripeSignature) {
      console.error('Missing Stripe signature')
      return new Response('Unauthorized', { status: 401 })
    }

    // TODO: Implement Stripe signature validation
    const isValidSignature = validateStripeSignature(rawBody, stripeSignature, Deno.env.get('SUPABASE_STRIPE_WEBHOOK_SECRET'))

    if (!isValidSignature) {
      console.error('Invalid Stripe signature')
      return new Response('Unauthorized', { status: 401 })
    }
    */

    // For now, skip signature validation - TODO: Implement for production
    console.log('Skipping signature validation - implement for production')

    // Extract order_id from webhook payload
    // This assumes the order ID is stored in metadata
    const orderId = payload.data?.object?.metadata?.order_id

    if (!orderId) {
      console.error('No order_id found in webhook metadata')
      return new Response('Order ID not found', { status: 400 })
    }

    console.log(`Processing order ${orderId}`)

    // Check if this is a successful payment event
    // For Stripe, this would be payment_intent.succeeded
    if (payload.type !== 'payment_intent.succeeded') {
      console.log(`Ignoring non-success event: ${payload.type}`)
      return new Response('Event ignored', { status: 200 })
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Call the RPC function to confirm order and credit user
    console.log(`Confirming order and crediting user for order ${orderId}`)

    const { data, error } = await supabase.rpc('confirm_order_and_credit_user', {
      p_order_id: parseInt(orderId)
    })

    if (error) {
      console.error('RPC error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process payment', details: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Payment confirmed successfully:', data)

    return new Response(
      JSON.stringify({
        message: 'Payment confirmed',
        order_id: data.order_id,
        user_id: data.user_id,
        credits_added: data.credits_added,
        new_balance: data.new_balance
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

// TODO: Implement signature validation function
/*
function validateStripeSignature(rawBody: string, signature: string, secret: string): boolean {
  // Implement Stripe webhook signature validation
  // See: https://stripe.com/docs/webhooks/signatures
  return true // Placeholder
}
*/
