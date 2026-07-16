// Token / Contract Address config. On launch, replace CA with the real address,
// commit & push — the site picks it up automatically (GitHub → Vercel auto-deploy).
export const CA: string = "7JPPACuAJmmCvnGCi2WtTEbUh76rGpr96eHLo5Nipump"; // Replace with real CA on launch
export const TICKER = "$STIFFY";
export const TOKEN_NAME = "Stiffy Tower";
export const X_URL = "https://x.com/soon"; // Replace with your X handle

// CA block: CA + Pump Fun + DexScreener. Link tails pull the CA variable (no hardcoding).
export const PUMP_URL = "https://pump.fun/coin/";
export const DEX_URL = "https://dexscreener.com/solana/";

export function isRealCA(): boolean {
  return CA !== "SOON" && CA.trim() !== "";
}
