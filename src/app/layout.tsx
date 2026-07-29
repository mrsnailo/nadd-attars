import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { ScrollObserver } from "@/components/ScrollObserver";

const cormorant = localFont({
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

const jakarta = localFont({
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

export const metadata: Metadata = {
  title: "NAḎḎ — Attars & Oud, Dhaka",
  description: "Dossiers inside exceptional perfumery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>
        <ScrollObserver />
        <header className="site-nav">
          <div className="nav-inner">
            <Link href="/" className="logo">NA<span>ḎḎ</span></Link>
            <nav className="navlinks">
              <Link href="/">Home</Link>
              <Link href="/collection">Collection</Link>
              <Link href="/about">House</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <div className="nav-right">
              <Link href="/cart" className="cart-btn">Bag · 0</Link>
            </div>
          </div>
        </header>

        {children}

        <footer>
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <h4>Explore</h4>
                <Link href="/collection">Full Collection</Link>
                <Link href="/about">The House of NADD</Link>
              </div>
              <div>
                <h4>Support</h4>
                <Link href="/contact">Contact & FAQ</Link>
                <Link href="#">Shipping</Link>
                <Link href="#">Returns</Link>
              </div>
              <div>
                <h4>Legal</h4>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Terms of Service</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <span>©2026 NADD Attars. All rights reserved.</span>
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
