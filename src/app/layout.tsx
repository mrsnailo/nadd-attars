import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import Link from "next/link";
import { GsapInit } from "@/components/GsapInit";

const cormorant = localFont({
  src: [
    { path: '../fonts/cormorant-garamond-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-garamond-500-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cormorant-garamond-600-latin.woff2', weight: '600', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-cormorant',
});

const jakarta = localFont({
  src: [
    { path: '../fonts/plus-jakarta-sans-300-latin.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/plus-jakarta-sans-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/plus-jakarta-sans-500-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/plus-jakarta-sans-600-latin.woff2', weight: '600', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-jakarta',
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
        <GsapInit />
        <header className="site-head" data-od-id="site-header">
          <div className="wrap site-head__inner">
            <Link href="/" className="brand" data-od-id="brand-mark">NA<em>ḎḎ</em></Link>
            <nav className="nav" aria-label="Primary" data-od-id="primary-nav">
              <Link className="nav__link" href="/" data-od-id="nav-house">House</Link>
              <Link className="nav__link" href="/collection" data-od-id="nav-collection">Collection</Link>
              <Link className="nav__link" href="/product" data-od-id="nav-attar">Attar</Link>
              <Link className="nav__link" href="/finder" data-od-id="nav-finder">Finder</Link>
            </nav>
            <Link className="nav__cart" href="/cart" data-od-id="cart-count">
              Vials <span className="num" data-cart-count>0</span>
            </Link>
            <button className="nav__toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-od-id="nav-toggle">
              Menu
            </button>
          </div>
        </header>

        {children}

        <footer className="site-foot" data-od-id="site-footer">
          <div className="wrap">
            <div className="site-foot__grid">
              <div className="site-foot__col">
                <p className="site-foot__note">Forty days in the dark, before a single vial opens.</p>
              </div>
              <div className="site-foot__col">
                <h4>House</h4>
                <ul className="site-foot__list">
                  <li><Link href="/">Index</Link></li>
                  <li><Link href="/collection">Collection</Link></li>
                  <li><Link href="/product">Attar</Link></li>
                  <li><Link href="/finder">Finder</Link></li>
                  <li><Link href="/cart">Cart</Link></li>
                </ul>
              </div>
              <div className="site-foot__col">
                <h4>Archive</h4>
                <ul className="site-foot__list">
                  <li><Link href="/finder">Olfactive families</Link></li>
                  <li><Link href="/collection">Batches</Link></li>
                  <li><Link href="/product">Dossiers</Link></li>
                </ul>
              </div>
              <div className="site-foot__col">
                <h4>Process</h4>
                <ul className="site-foot__list">
                  <li><Link href="/">Maceration</Link></li>
                  <li><Link href="/">Extraction &amp; origin</Link></li>
                  <li><Link href="/">Longevity &amp; sillage</Link></li>
                </ul>
              </div>
            </div>
            <div className="site-foot__meta">
              <span>NAḎḎ Attars · Dhaka</span>
              <span className="num">Six attars, one process</span>
              <span>Non-alcoholic oil attars</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
