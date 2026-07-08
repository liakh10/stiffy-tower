// Local persistence: best tower (floors) + best height + audio pref. Device-local.
const FLOORS_KEY = "stiffy_floors";
const HEIGHT_KEY = "stiffy_height";
const MUTED_KEY = "stiffy_muted";

export function getBestFloors(): number { try { return Number(localStorage.getItem(FLOORS_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestFloors(v: number): boolean {
  if (v <= getBestFloors()) return false;
  try { localStorage.setItem(FLOORS_KEY, String(v)); return true; } catch { return false; }
}

export function getBestHeight(): number { try { return Number(localStorage.getItem(HEIGHT_KEY) || "0") || 0; } catch { return 0; } }
export function saveBestHeight(v: number): boolean {
  if (v <= getBestHeight()) return false;
  try { localStorage.setItem(HEIGHT_KEY, String(v)); return true; } catch { return false; }
}

export function getMuted(): boolean { try { return localStorage.getItem(MUTED_KEY) === "1"; } catch { return false; } }
export function setMuted(v: boolean) { try { localStorage.setItem(MUTED_KEY, v ? "1" : "0"); } catch { /* */ } }
