export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getProducts } from "@/lib/db";
import Image from "next/image";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default async function HomePage() {
  const products = await getProducts();
  const indexProducts = products.slice(0, 4); // Limit for the index

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <span className="eyebrow on-dark reveal is-visible">Non-Alcoholic Oil Attars — Est. Dhaka</span>
          <h1 className="reveal is-visible" style={{ transitionDelay: '.1s' }}>
            Scent that sits<br/>on the skin,<br/><em>not the air.</em>
          </h1>
          <p className="reveal is-visible" style={{ transitionDelay: '.2s' }}>
            Oud, saffron and rose distilled the old way — no ethanol, no rush. Each vial rests forty days in dark glass before it reaches a shelf.
          </p>
          <Link href="/collection" className="btn-gold reveal is-visible" style={{ transitionDelay: '.3s', alignSelf: 'flex-start' }}>
            Enter the Collection →
          </Link>
        </div>
        <div className="hero-right">
          <div className="hero-meta reveal is-visible" style={{ transitionDelay: '.2s' }}>
            <div className="hero-meta-row"><span>Origin</span><span>Cambodia · Kashmir · Taif</span></div>
            <div className="hero-meta-row"><span>Format</span><span>Pure oil, no carrier alcohol</span></div>
            <div className="hero-meta-row"><span>Batch</span><span>Aged 40+ days, dark glass</span></div>
            <div className="hero-meta-row"><span>Shipping</span><span>Dhaka, nationwide 5–9 days</span></div>
          </div>
          <div className="hero-vial-wrap reveal is-visible" style={{ transitionDelay: '.3s' }}>
            <div className="vial"></div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px' }}>Dahn al Oud</div>
              <div style={{ color: 'var(--muted-on-dark)', fontSize: '12px' }}>Current Reserve</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ASYMMETRIC COLLECTION GRID */}
      <section className="section wrap border-box">
        <div className="section-head reveal is-visible">
          <h2>The Index</h2>
          <p>An initial offering of pure parfum oils. Highly concentrated, meant to be worn intimately.</p>
        </div>
        <div className="asym-grid reveal is-visible">
            {indexProducts.map((p, i) => {
              const hasImage = p.images && p.images.length > 0;
              const imageUrl = hasImage ? p.images[0].blob_url : null;
              const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;
              
              return (
                <Link href={`/product/${p.slug}`} className={`prod-card ${i === 0 ? 'wide' : ''}`} key={p.id}>
                  <div className="prod-eyebrow">{p.family}</div>
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
                      <div className="vial"></div>
                    )}
                  </div>
                  <div>
                    <h3>{p.name}</h3>
                    <div className="prod-notes">Fine Attar / {p.size}</div>
                    <div className="prod-foot">
                      <span className="price">{p.currency} {p.price}</span>
                      <div className="prod-arrow">↗</div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </>
  );
}
