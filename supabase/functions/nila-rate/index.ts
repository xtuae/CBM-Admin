import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("NILA rate handler loaded")

serve(async (req) => {
  try {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=nila&vs_currencies=usd"
      );

      if (!response.ok) {
        console.error("NILA rate fetch failed with status", response.status);
        // Fallback to a reasonable default rate
        return new Response(
          JSON.stringify({ nila: 0.01234 }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const json = await response.json() as Record<string, any>;

      // Accept both shapes: { nila: { usd: 0.0123 } } or { nila: 0.0123 }
      const nila = json?.nila;
      const rate =
        typeof nila === "number"
          ? nila
          : typeof nila?.usd === "number"
          ? nila.usd
          : null;

      if (!rate || rate <= 0) {
        console.error("NILA rate missing/invalid in response", json);
        // Fallback to a reasonable default rate
        return new Response(
          JSON.stringify({ nila: 0.01234 }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ nila: rate }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (fetchError) {
      console.error('Error fetching from CoinGecko:', fetchError);
      // Fallback to a reasonable default rate
      return new Response(
        JSON.stringify({ nila: 0.01234 }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in NILA rate handler:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch NILA rate' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
