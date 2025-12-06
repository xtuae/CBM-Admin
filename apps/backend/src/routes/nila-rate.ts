import { Router } from 'express';

const router = Router();

// GET /api/v1/nila-rate - Get current NILA/USD rate
router.get('/', async (req, res): Promise<void> => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=nila&vs_currencies=usd"
    );

    if (!response.ok) {
      console.error("NILA rate fetch failed with status", response.status);
      // Fallback to a reasonable default rate
      res.json({ nila: 0.01234 });
      return;
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
      res.json({ nila: 0.01234 });
      return;
    }

    res.json({ nila: rate });
  } catch (error) {
    console.error('Error fetching NILA rate:', error);
    res.status(500).json({ error: 'Failed to fetch NILA rate' });
  }
});

export default router;
