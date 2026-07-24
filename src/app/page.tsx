export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getProducts } from "@/lib/db";
import Image from "next/image";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default async function HomePage() {
  const products = await getProducts();
  const indexProducts = products.slice(0, 4); // Limit for the index

    const gradients = [
    undefined,
    "linear-gradient(180deg, rgba(196,80,80,.55), rgba(107,30,30,.85))",
    "linear-gradient(180deg, rgba(212,175,55,.6), rgba(107,86,20,.9))",
    "linear-gradient(180deg, rgba(224,220,208,.65), rgba(150,146,130,.85))",
    "linear-gradient(180deg, rgba(120,90,170,.55), rgba(55,35,90,.85))",
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <span className="eyebrow on-dark reveal">Non-Alcoholic Oil Attars — Est. Dhaka</span>
          <h1 className="reveal" style={{ transitionDelay: '.1s' }}>
            Scent that sits<br/>on the skin,<br/><em>not the air.</em>
          </h1>
          <p className="reveal" style={{ transitionDelay: '.2s' }}>
            Oud, saffron and rose distilled the old way — no ethanol, no rush. Each vial rests forty days in dark glass before it reaches a shelf.
          </p>
          <Link href="/collection" className="btn-gold reveal" style={{ transitionDelay: '.3s', alignSelf: 'flex-start' }}>
            Enter the Collection →
          </Link>
        </div>
        <div className="hero-right">
          <div className="hero-meta reveal" style={{ transitionDelay: '.2s' }}>
            <div className="hero-meta-row"><span>Origin</span><span>Cambodia · Kashmir · Taif</span></div>
            <div className="hero-meta-row"><span>Format</span><span>Pure oil, no carrier alcohol</span></div>
            <div className="hero-meta-row"><span>Batch</span><span>Aged 40+ days, dark glass</span></div>
            <div className="hero-meta-row"><span>Shipping</span><span>Dhaka, nationwide 5–9 days</span></div>
          </div>
          <div className="hero-vial-wrap reveal" style={{ transitionDelay: '.3s' }}>
            <div className="vial"></div>
            <div className="mono" style={{ fontSize: '10.5px', color: 'var(--muted-on-dark)', letterSpacing: '.14em' }}>
              No. 01<br/>DAHN AL OUD
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-band">
        <div className="marquee-track">
          <span>Cambodian Oud</span><span>Kashmiri Saffron</span><span>Taifi Rose</span><span>White Musk</span><span>Amber Resin</span><span>Bakhoor Smoke</span>
          <span>Cambodian Oud</span><span>Kashmiri Saffron</span><span>Taifi Rose</span><span>White Musk</span><span>Amber Resin</span><span>Bakhoor Smoke</span>
        </div>
      </div>
      
      {/* COLLECTION PREVIEW */}
      <section className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Six attars, one process</h2>
            <p>Every bottle carries a dossier of olfactory data — family, concentration, longevity, sillage — the same way a lab would log a specimen.</p>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', border: '1px solid var(--line-on-linen)' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '12px' }}>The collection is currently aging.</div>
              <div style={{ color: 'var(--muted-on-linen)', fontSize: '14.5px' }}>Check back soon for our initial releases.</div>
            </div>
          ) : (
            <div className="asym-grid">
                {indexProducts.map((p, i) => {
                  const hasImage = p.images && p.images.length > 0;
                  const imageUrl = hasImage ? p.images[0].blob_url : null;
                  const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;
                  const customGradient = gradients[i % gradients.length];
                  
                  const isWide = (i % 5 === 0) || (i % 5 === 4);
                  
                  return (
                    <Link href={`/product/${p.slug}`} className={`prod-card ${isWide ? 'wide' : ''} reveal reveal-stagger`} style={{ '--i': i } as React.CSSProperties} key={p.id}>
                      <div className="prod-vial-row" style={{ position: 'relative' }}>
                        {imageUrl ? (
                          <div style={{ position: 'relative', width: '56px', height: '104px' }}>
                             <Image 
                               src={imageUrl} 
                               alt={altText} 
                               fill
                               style={{ objectFit: 'contain' }}
                               placeholder="blur"
                               blurDataURL={BLUR_URL}
                             />
                          </div>
                        ) : (
                          <div className="vial" style={customGradient ? { background: customGradient } : {}}></div>
                        )}
                      </div>
                      <div>
                        <div className="prod-eyebrow">{p.family}</div>
                        <h3>{p.name}</h3>
                        <p className="prod-notes">Fine Attar / {p.size}</p>
                        <div className="prod-foot">
                          <span className="price">{p.currency} {p.price}</span>
                          <div className="prod-arrow">↗</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="section tight">
        <div className="wrap">
          <div className="edit-split reveal">
            <div className="edit-visual"><div className="ring r1"></div><div className="ring r2"></div><div className="ring r3"></div></div>
            <div className="edit-copy">
              <span className="eyebrow">The Process</span>
              <h2 style={{ marginTop: '14px' }}>Forty days in the dark, before a single vial opens.</h2>
              <p>Every batch is macerated in aged sandalwood and left to settle in amber glass, away from light. What comes out isn&apos;t sprayed — it&apos;s dabbed, warmed by skin, and left to unfold in its own time.</p>
              <p>No alcohol carrier means no sharp opening and no fast fade. What you smell in the first minute is close to what lingers in the eighth hour.</p>
              <Link href="/about" className="btn-line" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Read the Full Process →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
