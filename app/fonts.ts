import { Fredoka, Nunito, JetBrains_Mono } from "next/font/google";

// Stiffy Tower identity — clean flat playground. Fredoka is a rounded, friendly
// display (distinct from Titan One / Bricolage / Baloo used by the other games).
export const display = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
export const sans = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});
