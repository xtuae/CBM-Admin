// apps/admin/src/lib/fetchNilaRate.ts
import { useState, useEffect, useCallback } from 'react';

const FALLBACK_RATE = 0.01234;

export async function fetchNilaRate(): Promise<number> {
  try {
    // 1. Try backend endpoint first if configured (avoids CORS and rate limits)
    const backendEndpoint = import.meta.env.VITE_NILA_RATE_ENDPOINT;
    if (backendEndpoint) {
      try {
        console.log('Fetching NILA rate via backend proxy:', backendEndpoint);
        const res = await fetch(backendEndpoint);

        if (res.ok) {
          const json = await res.json() as { nila: number };
          const rate = json?.nila;

          if (typeof rate === 'number' && rate > 0) {
            console.log('Using rate from backend proxy:', rate);
            return rate;
          }
        }
      } catch (proxyErr) {
        console.warn('Backend proxy failed, falling back to CoinGecko:', proxyErr);
      }
    }

    // 2. Fallback to CoinGecko API
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=nila&vs_currencies=usd"
    );

    if (res.ok) {
      const json = await res.json();

      // Accept both shapes: { nila: { usd: 0.0123 } } or { nila: 0.0123 }
      const nila = json?.nila;
      const rate =
        typeof nila === "number"
          ? nila
          : typeof nila?.usd === "number"
          ? nila.usd
          : null;

      // If we got a valid rate from CoinGecko, return it
      if (rate && rate > 0) {
        return rate;
      }
    }

    // If all requests failed or NIL is not listed, return fallback
    console.log(`NILA not found on any API, using fallback rate: ${FALLBACK_RATE}`);
    return FALLBACK_RATE;
  } catch (err) {
    console.error("Failed to fetch NILA rate from any source, using fallback:", err);
    return FALLBACK_RATE;
  }
}

// Auto-update hook for NILA rate
export function useNilaRate(autoUpdate = false) {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newRate = await fetchNilaRate();
      setRate(newRate);
    } catch (err) {
      console.error("Error loading NILA rate:", err);
      setError("Failed to fetch $NILA rate — using fallback.");
      setRate(FALLBACK_RATE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  useEffect(() => {
    if (!autoUpdate) return;

    // Auto-update every 10 minutes (600000ms) to avoid rate limiting
    const interval = setInterval(loadRate, 600000);
    return () => clearInterval(interval);
  }, [autoUpdate, loadRate]);

  return { rate, loading, error, refresh: loadRate };
}
