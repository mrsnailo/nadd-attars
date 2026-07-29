import localFont from "next/font/local";

export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-400-latinext.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond-500-latinext.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-600-latinext.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorant-garamond-600-latin.woff2", weight: "600", style: "normal" }
  ],
  variable: "--font-cormorant",
  display: "swap"
});

export const jakarta = localFont({
  src: [
    { path: "../fonts/plus-jakarta-sans-300-latinext.woff2", weight: "300", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-300-latin.woff2", weight: "300", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-400-latinext.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-500-latinext.woff2", weight: "500", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-500-latin.woff2", weight: "500", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-600-latinext.woff2", weight: "600", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-600-latin.woff2", weight: "600", style: "normal" }
  ],
  variable: "--font-jakarta",
  display: "swap"
});
