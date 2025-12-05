/**
 * Update NILA Equivalents Edge Function
 *
 * This function fetches the latest USD→NILA exchange rate and updates the
 * `nila_equivalent` column for all credit packs in the database.
 *
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access
 * - NILA_RATE_API_URL: (Optional) Custom API URL for exchange rates
 *
 * If NILA_RATE_API_URL is not provided, falls back to CoinGecko API.
 * Note: CoinGecko token ID "nila" should be validated for your specific token.
 *
 * Usage:
 * - Deploy: supabase functions deploy update-nila-equivalents
 * - Invoke: supabase functions invoke update-nila-equivalents
 * - Or POST to: https://your-project.supabase.co/functions/v1/update-nila-equivalents
 *
 * Scheduling: Can be called via cron job or webhook to update rates periodically.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateResponse {
  usd_to_nila?: number;
  rate?: number;
}

interface CreditPack {
  id: string;
  slug: string;
  price_fiat: number;
}

interface UpdateResult {
  success: boolean;
  updatedCount: number;
  samples: Array<{
    slug: string;
    price_fiat: number;
    nila_equivalent: number;
  }>;
  rate: number;
  timestamp: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback to CoinGecko API if no custom API URL provided
// Note: Validate that "nila" is the correct token ID for your specific token
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=nila&vs_currencies=usd';

async function fetchExchangeRate(customApiUrl?: string): Promise<number> {
  const apiUrl = customApiUrl || COINGECKO_API_URL;

  console.log(`Fetching exchange rate from: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: RateResponse = await response.json();
    console.log('Exchange rate response:', JSON.stringify(data, null, 2));

    // Handle different response formats
    let rateUsdToNila: number;

    if (customApiUrl) {
      // Custom API format
      if (data.usd_to_nila !== undefined) {
        rateUsdToNila = data.usd_to_nila;
      } else if (data.rate !== undefined) {
        rateUsdToNila = data.rate;
      } else {
        throw new Error('Custom API response missing usd_to_nila or rate field');
      }
    } else {
      // CoinGecko format: { "nila": { "usd": 0.12345 } }
      const coingeckoData = data as any;
      if (coingeckoData.nila?.usd) {
        // CoinGecko returns USD per NILA, we need NILA per USD
        rateUsdToNila = 1 / coingeckoData.nila.usd;
      } else {
        throw new Error('CoinGecko API response missing nila.usd field');
      }
    }

    if (typeof rateUsdToNila !== 'number' || isNaN(rateUsdToNila) || rateUsdToNila <= 0) {
      throw new Error(`Invalid exchange rate: ${rateUsdToNila}`);
    }

    console.log(`Exchange rate USD→NILA: ${rateUsdToNila}`);
    return rateUsdToNila;

  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    throw new Error(`Exchange rate fetch failed: ${error.message}`);
  }
}

async function updateCreditPackEquivalents(
  supabase: any,
  rateUsdToNila: number
): Promise<{ updatedCount: number; samples: any[] }> {
  console.log('Fetching credit packs from database...');

  // Fetch all credit packs with price_fiat
  const { data: creditPacks, error: fetchError } = await supabase
    .from('credit_packs')
    .select('id, slug, price_fiat')
    .not('price_fiat', 'is', null);

  if (fetchError) {
    throw new Error(`Database fetch failed: ${fetchError.message}`);
  }

  if (!creditPacks || creditPacks.length === 0) {
    console.log('No credit packs found with price_fiat');
    return { updatedCount: 0, samples: [] };
  }

  console.log(`Found ${creditPacks.length} credit packs to update`);

  let updatedCount = 0;
  const samples: Array<{ slug: string; price_fiat: number; nila_equivalent: number }> = [];

  // Update each credit pack individually
  // Note: In production, consider using a single transaction or batch update for better performance
  for (const pack of creditPacks) {
    const nilaEquivalent = pack.price_fiat * rateUsdToNila;

    const { error: updateError } = await supabase
      .from('credit_packs')
      .update({ nila_equivalent: nilaEquivalent })
      .eq('id', pack.id);

    if (updateError) {
      console.error(`Failed to update ${pack.slug}:`, updateError.message);
      continue; // Continue with other packs
    }

    updatedCount++;

    // Collect samples for response (first 3)
    if (samples.length < 3) {
      samples.push({
        slug: pack.slug,
        price_fiat: pack.price_fiat,
        nila_equivalent: Math.round(nilaEquivalent * 100000000) / 100000000 // Round to 8 decimal places
      });
    }
  }

  console.log(`Successfully updated ${updatedCount}/${creditPacks.length} credit packs`);
  return { updatedCount, samples };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const nilaRateApiUrl = Deno.env.get('NILA_RATE_API_URL');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    console.log('Starting NILA equivalents update...');
    console.log(`Using custom API URL: ${nilaRateApiUrl || 'No (using CoinGecko fallback)'}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch exchange rate
    const rateUsdToNila = await fetchExchangeRate(nilaRateApiUrl);

    // Update credit pack equivalents
    const { updatedCount, samples } = await updateCreditPackEquivalents(supabase, rateUsdToNila);

    // Prepare response
    const result: UpdateResult = {
      success: true,
      updatedCount,
      samples,
      rate: rateUsdToNila,
      timestamp: new Date().toISOString()
    };

    console.log('Update completed successfully:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Function error:', error);

    // Don't leak sensitive information in error responses
    const errorMessage = error.message.includes('SUPABASE_SERVICE_ROLE_KEY')
      ? 'Configuration error'
      : error.message;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: error.message.includes('API request failed') ? 502 : 500
      }
    );
  }
});