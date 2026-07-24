import Link from 'next/link';

export default function HomePage() {
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
            <Link href="/product/dahn-al-oud" className="prod-card wide">
              <div className="prod-eyebrow">Oud</div>
              <div className="prod-vial-row"><div className="vial"></div></div>
              <div>
                <h3>Dahn al Oud</h3>
                <div className="prod-notes">Fine Attar / 3ml</div>
                <div className="prod-foot">
                  <span className="price">USD 120</span>
                  <div className="prod-arrow">↗</div>
                </div>
              </div>
            </Link>
            <Link href="/product/amber-rose" className="prod-card">
              <div className="prod-eyebrow">Floral</div>
              <div className="prod-vial-row"><div className="vial"></div></div>
              <div>
                <h3>Amber & Rose</h3>
                <div className="prod-notes">Fine Attar / 3ml</div>
                <div className="prod-foot">
                  <span className="price">USD 85</span>
                  <div className="prod-arrow">↗</div>
                </div>
              </div>
            </Link>
        </div>
      </section>
    </>
  );
}
