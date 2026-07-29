export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getProducts } from "@/lib/db";
import Image from "next/image";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default async function HomePage() {
  const products = await getProducts();
  const indexProducts = products.slice(0, 6);

  return (
    <main id="content">
      {/* 1. HERO */}
      <section className="hero on-dark" data-od-id="hero">
        <div className="wrap hero__inner">
          <div>
            <p className="eyebrow" data-motion="mask">Dhaka · Single house · Six attars</p>
            <h1 className="hero__mark" data-motion="mask">NA<em>ḎḎ</em><br/>Attars</h1>
            <p className="hero__sub" data-motion="mask">Scent that sits on the skin, not the air.</p>
            <hr className="rule-inv hairline-draw hero__rule" data-motion="hairline" />
            <div className="hero__meta">
              <span className="label num">Non-alcoholic oil</span>
              <span className="label num">40-day maceration</span>
              <span className="label num">Batch 041 open</span>
            </div>
            <Link className="link-gold" href="/collection" data-od-id="hero-link">Read the archive</Link>
          </div>

          <div className="hero__stage" data-od-id="hero-stage">
            <svg className="hero__rings" viewBox="0 0 560 560" aria-hidden="true" focusable="false">
              <circle cx="280" cy="280" r="80" />
              <circle cx="280" cy="280" r="144" />
              <circle cx="280" cy="280" r="208" />
              <circle cx="280" cy="280" r="272" />
            </svg>
            <div className="hero__vial" data-motion="parallax" data-parallax="0.10">
              <div className="vial vial--lg" role="img" aria-label="A 3 millilitre attar vial with a gold cap, half filled with oil.">
                <span className="vial__cap"></span>
                <span className="vial__neck"></span>
                <span className="vial__body"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SIX */}
      <section className="section wrap" data-od-id="the-six">
        <div className="head">
          <p className="eyebrow" data-motion="mask">The collection</p>
          <div className="head__row">
            <h2 data-motion="mask">Six attars, one process.</h2>
            <p className="lead head__note">Each vial carries a dossier: family, concentration, origin, extraction, and the batch it was drawn from.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>

        <div className="grid-hair" data-od-id="six-grid">
          {indexProducts.map((p, i) => {
            const hasImage = p.images && p.images.length > 0;
            const imageUrl = hasImage ? p.images[0].blob_url : null;
            const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;
            const isWide = (i === 0);
            
            return (
              <Link className={`six__card ${isWide ? 'col-3' : 'col-2'}`} href={`/product/${p.slug}`} key={p.id}>
                <span className="six__index num">0{i+1} · Batch 041</span>
                <div>
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '44px', height: '100px', marginBottom: 'var(--s-4)' }}>
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
                    <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
                  )}
                  <h3 className="six__name">{p.name}</h3>
                  <div className="six__spec">
                    <span>Family · <b>{p.family || 'Undefined'}</b></span>
                    <span>Concentration · <b>{p.concentration || '10%'}</b></span>
                    {p.origin && <span>Origin · <b>{p.origin}</b></span>}
                  </div>
                </div>
                <div className="six__foot">
                  <span className="label">3 ml vial · 60 drawn</span>
                  <span className="six__price">{p.currency} {p.price}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. MACERATION BLOCK */}
      <section className="section wrap" data-od-id="maceration">
        <div className="grid-hair">
          <div className="col-2 panel" style={{ padding: 'var(--s-8) var(--s-6)' }}>
            <p className="eyebrow">The Method</p>
            <h3 style={{ marginTop: 'var(--s-5)', maxWidth: '14ch' }}>Every batch rests forty days in the dark.</h3>
            <p className="lead" style={{ marginTop: 'var(--s-4)' }}>We macerate in aged sandalwood, away from light and heat. What emerges feels dense and moves slowly.</p>
          </div>
          <div className="col-4 panel" style={{ display: 'grid', placeItems: 'center', minHeight: '320px', padding: 'var(--s-6)' }}>
            <svg viewBox="0 0 420 420" style={{ width: '100%', maxWidth: '320px' }}>
              <circle cx="210" cy="210" r="200" fill="none" stroke="var(--rule)" strokeWidth="1" />
              <path d="M 210,10 A 200,200 0 0,1 410,210" fill="none" stroke="var(--gold)" strokeWidth="2" />
              <text x="210" y="215" textAnchor="middle" className="num" style={{ fontSize: '2.5rem', fill: 'var(--fg)' }}>40</text>
              <text x="210" y="235" textAnchor="middle" className="label" style={{ fill: 'var(--muted)' }}>Days</text>
              
              <circle cx="210" cy="10" r="4" fill="var(--gold)" />
              <circle cx="410" cy="210" r="4" fill="var(--gold)" />
            </svg>
          </div>
        </div>
      </section>

      {/* 4. DISCOVERY SET */}
      <section className="section wrap" data-od-id="discovery">
        <div className="panel" style={{ padding: 'var(--s-8) var(--s-6)', display: 'grid', gap: 'var(--s-6)', justifyItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
            <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
          </div>
          <div>
            <h3>The Discovery Set</h3>
            <p className="lead" style={{ maxWidth: '42ch', margin: 'var(--s-2) auto 0' }}>Six 0.5ml vials to document the full olfactory range of the house on your own skin.</p>
          </div>
          <Link className="btn-gold" href="/finder" data-od-id="discovery-cta">Take the set · ৳ 2,400</Link>
        </div>
      </section>
    </main>
  );
}
