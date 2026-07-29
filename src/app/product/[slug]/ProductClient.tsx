/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductClient({ product, imageUrl, altText, blurUrl }: { product: any, imageUrl: string | null, altText: string, blurUrl: string }) {
  const SIZES = {
    "3":  { price: Number(product.price), drops: 60, drawn: 60, left: product.stock_count, status: product.stock_count > 20 ? "in" : product.stock_count > 0 ? "low" : "sold" },
    "6":  { price: Math.round(Number(product.price) * 1.8), drops: 120, drawn: 24, left: 0, status: "unavailable" },
    "12": { price: Math.round(Number(product.price) * 3.3), drops: 240, drawn: 0, left: 0, status: "unavailable" }
  };
  
  const [size, setSize] = useState<"3" | "6" | "12">("3");
  const [overrideState, setOverrideState] = useState<string | null>(null);
  
  // Real or overridden states
  const getState = (s: "3" | "6" | "12") => {
    if (overrideState) {
       if (overrideState === "sold") return "sold";
       if (overrideState === "in" && s === "3") return "in";
       if (overrideState === "low" && s === "6") return "low";
       if (overrideState === "unavailable" && s === "12") return "unavailable";
       return overrideState === "sold" ? "sold" : "unavailable"; // Fallbacks for demo
    }
    return SIZES[s].status;
  };

  const st = overrideState || SIZES[size].status;
  const d = {
    ...SIZES[size],
    left: st === 'in' ? 41 : st === 'low' ? 11 : 0,
    drawn: st === 'unavailable' ? 0 : SIZES[size].drawn
  };
  // Wait, if not passing override, use actual
  if (!overrideState) {
      d.left = product.stock_count;
      d.drawn = Math.max(60, product.stock_count);
  }

  const taka = (n: number) => "৳ " + n.toLocaleString("en-US");

  // Interaction handlers
  const handleSizeClick = (s: "3" | "6" | "12") => {
    if (getState(s) !== "unavailable" && getState(s) !== "sold") {
      setSize(s);
    }
  };
  
  // Pyramid intersection observer
  const [resolvedTiers, setResolvedTiers] = useState<Record<string, boolean>>({});
  const tierRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
       const all = product.notes?.reduce((acc: Record<string, boolean>, _: unknown, i: number) => ({ ...acc, [i]: true }), {});
       // eslint-disable-next-line
       setResolvedTiers(all || {});
       return;
    }
    const obs = new IntersectionObserver((entries) => {
       entries.forEach(e => {
         if (e.isIntersecting) {
           const id = e.target.getAttribute("data-tier-id");
           if (id) setResolvedTiers(prev => ({...prev, [id]: true}));
           obs.unobserve(e.target);
         }
       });
    }, { threshold: 0.55 });
    
    tierRefs.current.forEach(t => t && obs.observe(t));
    return () => obs.disconnect();
  }, [product.notes]);

  // Sticky bar intersection observer
  const [barIn, setBarIn] = useState(false);
  const pyramidRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const onScroll = () => {
      if (pyramidRef.current) {
        setBarIn(pyramidRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  // Accordion
  const [accOpen, setAccOpen] = useState({ 1: true, 2: false, 3: false });
  const toggleAcc = (n: 1|2|3) => setAccOpen(p => ({ ...p, [n]: !p[n] }));

  // Add to cart dummy for now
  const [cartAck, setCartAck] = useState(false);
  const handleAdd = () => {
    setCartAck(true);
    setTimeout(() => setCartAck(false), 1400);
  };

  return (
    <>
      <main id="content" data-od-id="page-product">
        <section className="section section--tight wrap" data-od-id={`product-${product.slug}`}>
          <div className="pd">
            
            {/* Left: sticky vial stage */}
            <aside className="pd__stage" data-od-id="product-stage">
              <div className="pd__vial-wrap">
                <svg className="pd__rings" viewBox="0 0 440 440" aria-hidden="true" focusable="false">
                  <circle cx="220" cy="220" r="70"></circle>
                  <circle cx="220" cy="220" r="124"></circle>
                  <circle cx="220" cy="220" r="178"></circle>
                </svg>
                <div className="pd__vial" data-vial style={{ width: '150px', height: '280px', position: 'relative', zIndex: 1, marginTop: '70px' }}>
                  {imageUrl ? (
                     <Image src={imageUrl} alt={altText} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={blurUrl} priority />
                  ) : (
                     <div className="vial vial--lg" role="img" aria-label={`A ${size} millilitre ${product.name} vial`}>
                       <span className="vial__cap"></span>
                       <span className="vial__neck"></span>
                       <span className="vial__body"></span>
                     </div>
                  )}
                </div>
              </div>

              <div className="pd__fill">
                <p className="label">Batch draw &middot; <span className="num" data-batch-drawn>{d.drawn === 0 ? "0" : d.drawn}</span> vials</p>
                <div className="pd__fill-bar" role="img" aria-label={`${d.left} of ${d.drawn} vials remain in batch 041`}>
                  <span style={{ "--v": st === 'sold' || st === 'unavailable' || !d.drawn ? 0 : Math.round((d.left / d.drawn) * 100) } as React.CSSProperties} data-batch-bar></span>
                </div>
                <div className="pd__fill-scale">
                  <span data-batch-left>{st === "sold" ? "0 remain" : st === "unavailable" ? "not drawn" : `${d.left} remain`}</span>
                  <span data-batch-code>Batch {product.batch_no || '041'} &middot; drawn 21.01</span>
                </div>
              </div>

              <div className="pd__caption">
                <span className="eyebrow">{product.name} &middot; {size} ml</span>
                <span className="eyebrow num" data-stage-size>{size} ml &middot; {d.drops} drops</span>
              </div>
            </aside>

            {/* Right: the dossier */}
            <div className="pd__col">

              {/* 1. Identity */}
              <div className="pd__block" data-od-id="product-identity">
                <p className="eyebrow" data-motion="mask">Attar {product.id.slice(-2)} &middot; Archive {product.batch_no || '041'}</p>
                <h1 className="pd__name" data-motion="mask">{product.name}</h1>
                <p className="pd__family">{product.family} &mdash; {product.subtitle || 'Expertly balanced and aged.'}</p>

                <div className="pd__price-row">
                  <span className="pd__price num" data-price>{taka(d.price)}</span>
                  <span className="pd__per num" data-per>{taka(Math.round(d.price / parseInt(size, 10)))} per ml</span>
                </div>

                <div className="seg" role="radiogroup" aria-label="Vial size" data-od-id="size-selector">
                  {(["3", "6", "12"] as const).map(s => {
                    const bSt = getState(s);
                    const bD = SIZES[s];
                    // Overrides mapping for rendering 6ml/12ml properly when overridden
                    let bLeft = bSt === 'in' ? 41 : bSt === 'low' ? 11 : 0;
                    let bDrawn = bSt === 'unavailable' ? 0 : bD.drawn;
                    if (!overrideState) { bLeft = bD.left; bDrawn = Math.max(60, bD.left); }
                    
                    return (
                      <button key={s} className="seg__opt" type="button" role="radio" 
                        aria-checked={s === size} 
                        disabled={bSt === "unavailable" || bSt === "sold"}
                        onClick={() => handleSizeClick(s)}
                      >
                        <span className="seg__size">{s} ml</span>
                        <span className="seg__cost num">{taka(bD.price)}</span>
                        <span className="seg__note">
                          {bSt === "unavailable" ? "Not drawn" : bSt === "sold" ? "Sold out" : bSt === "low" ? `${bLeft} left` : `${bDrawn} drawn`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="stock" data-stock data-status={st} aria-live="polite">
                  <i aria-hidden="true"></i>
                  <span data-stock-text dangerouslySetInnerHTML={{ __html: 
                    st === "in" ? `Batch ${product.batch_no || '041'} open &middot; <b class="num">${d.left}</b> of <b class="num">${d.drawn}</b> vials remain` :
                    st === "low" ? `Low batch &middot; <b class="num">${d.left}</b> vials of <b class="num">${d.drawn}</b> remain at this size` :
                    st === "sold" ? `Sold out &middot; batch closed` :
                    `<b class="num">${size} ml</b> was not drawn for this batch`
                  }}></span>
                </p>
              </div>

              {/* 2. PYRAMID */}
              <div className="pd__block" data-od-id="product-pyramid" ref={pyramidRef}>
                <div className="pd__legend">
                  <h2 data-motion="mask">Read from the top down.</h2>
                  <p className="lead head__note">Oil does not open the way alcohol does. Each tier arrives at skin temperature, in its own time.</p>
                </div>

                <div className="pyr" data-od-id="pyramid-tiers">
                  {product.notes && product.notes.length > 0 ? product.notes.map((note: Record<string, any>, i: number) => (
                    <div key={note.id} className={`pyr__tier ${resolvedTiers[i] ? 'is-resolved' : ''}`} data-tier-id={i} ref={(el) => { if(el) tierRefs.current[i] = el; }}>
                      <h3>{note.tag}</h3>
                      <p className="pyr__notes">{note.notes}</p>
                      <p className="pyr__time num">{note.time}<br/>{note.description}</p>
                      <i className="pyr__hair" aria-hidden="true"></i>
                    </div>
                  )) : (
                     <p className="muted">Olfactive notes are being updated.</p>
                  )}
                </div>
              </div>

              {/* 3. DOSSIER */}
              <div className="pd__block" data-od-id="product-dossier">
                <div className="pd__legend">
                  <h2 data-motion="mask">The dossier.</h2>
                  <p className="lead head__note">Logged against the material lot at the draw. Nothing is blended from an unnamed source.</p>
                </div>
                <table className="dossier" data-od-id="dossier-table">
                  <caption>{product.name} &middot; batch {product.batch_no || '041'}</caption>
                  <tbody>
                    <tr>
                      <th scope="row">Origin</th>
                      <td>{product.origin || 'Sylhet, Bangladesh'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Extraction</th>
                      <td>{product.extraction || 'Hydro-distilled'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Concentration</th>
                      <td><span className="num">{product.concentration || '24%'}</span></td>
                    </tr>
                    <tr>
                      <th scope="row">Maceration</th>
                      <td>{product.aged_time || '40 days'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Batch</th>
                      <td><span className="num">{product.batch_no || '041'}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. PERFORMANCE */}
              <div className="pd__block" data-od-id="product-performance">
                <div className="pd__legend">
                  <h2 data-motion="mask">Sillage and longevity.</h2>
                </div>
                <div className="perf" data-od-id="performance-bars">
                  {product.metrics && (
                    <>
                      <div className="perf__row">
                        <div className="perf__label"><strong>Sillage</strong></div>
                        <div className="perf__scale">
                          <i style={{left:0}}></i><i style={{left:"25%"}}></i><i style={{left:"50%"}}></i><i style={{left:"75%"}}></i><i style={{left:"calc(100% - 1px)"}}></i>
                          <span className="perf__bar" style={{ "--v": product.metrics.sillage || 50 } as React.CSSProperties} role="img"></span>
                        </div>
                        <p className="perf__val">{product.metrics.sillage || 50}%</p>
                      </div>
                      <div className="perf__row">
                        <div className="perf__label"><strong>Longevity</strong></div>
                        <div className="perf__scale">
                          <i style={{left:0}}></i><i style={{left:"25%"}}></i><i style={{left:"50%"}}></i><i style={{left:"75%"}}></i><i style={{left:"calc(100% - 1px)"}}></i>
                          <span className="perf__bar" style={{ "--v": product.metrics.longevity || 50 } as React.CSSProperties} role="img"></span>
                        </div>
                        <p className="perf__val">{product.metrics.longevity || 50}%</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 5. APPLICATION */}
              <div className="pd__block" data-od-id="product-application">
                <div className="pd__legend"><h2 data-motion="mask">How this one is worn.</h2></div>
                <div className="apply__list">
                  <div className="apply__item">
                    <span className="num">01</span>
                    <div><h3>Half a drop, behind the ear</h3><p>The warmest point on the body. At this concentration a full drop burns the saffron off inside ten minutes.</p></div>
                  </div>
                  <div className="apply__item">
                    <span className="num">02</span>
                    <div><h3>Press, never rub</h3><p>Friction shears the top notes off the carrier. Press the two wrists together and let them dry open.</p></div>
                  </div>
                </div>
              </div>

              {/* 6. ACCORDION */}
              <div className="pd__block" data-od-id="product-terms">
                <div className="pd__legend"><h2 data-motion="mask">Terms of the vial.</h2></div>
                <div className="acc" data-od-id="terms-accordion">
                  <div className="acc__item" data-open={accOpen[1]}>
                    <button className="acc__head" type="button" aria-expanded={accOpen[1]} onClick={() => toggleAcc(1)}>
                      Shipping <span>01</span>
                    </button>
                    <div className="acc__panel"><div>
                      <p>Dhaka, next day by courier. Elsewhere in Bangladesh, two to three days.</p>
                    </div></div>
                  </div>
                  <div className="acc__item" data-open={accOpen[2]}>
                    <button className="acc__head" type="button" aria-expanded={accOpen[2]} onClick={() => toggleAcc(2)}>
                      Returns <span>02</span>
                    </button>
                    <div className="acc__panel"><div>
                      <p>An unopened vial returns within 14 days for a full refund, seal intact.</p>
                    </div></div>
                  </div>
                </div>

                {/* State rail */}
                <div className="states" data-od-id="product-states">
                  <span className="states__legend">Availability state</span>
                  {(["in", "low", "sold", "unavailable"] as const).map(s => (
                    <button key={s} className="link-under" type="button" 
                      aria-pressed={overrideState ? overrideState === s : SIZES[size].status === s}
                      onClick={() => {
                        setOverrideState(s);
                        if(s === "in") setSize("3");
                        else if(s === "low") setSize("6");
                        else if(s === "unavailable") setSize("12");
                        else if(s === "sold") setSize("3");
                      }}
                    >
                      {s === "in" ? "In stock" : s === "low" ? "Low batch" : s === "sold" ? "Sold out" : "Size unavailable"}
                    </button>
                  ))}
                  {overrideState && <button className="link-under" style={{marginLeft:'auto'}} onClick={() => setOverrideState(null)}>Reset (Real Data)</button>}
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bar */}
      <div className={`bar ${barIn ? 'is-in' : ''}`} data-od-id="sticky-bar" hidden={false}>
        <div className="wrap bar__inner">
          <div className="bar__id">
            <strong>{product.name}</strong>
            <span>Batch {product.batch_no || '041'} &middot; {size} ml</span>
          </div>

          <div className="bar__right" hidden={st === "sold"}>
            <span className="bar__price num">{taka(d.price)}</span>
            <span className="field__hint">
              {st === "low" ? `Low batch \u00B7 ${d.left} vials left` : st === "unavailable" ? "Choose 3 ml or 6 ml" : `${d.left} of ${d.drawn} vials remain`}
            </span>
            <button className="btn-gold" type="button" disabled={st === "unavailable"} onClick={handleAdd}>
              {cartAck ? `Logged \u00B7 ${size} ml` : st === "unavailable" ? "Not drawn" : "Add the vial"}
            </button>
          </div>

          <form className="bar__right notify" hidden={st !== "sold"} onSubmit={e => e.preventDefault()}>
            <div className="field">
              <label className="field__hint">Batch closed &middot; tell me when drawn</label>
              <input className="field__input" type="email" placeholder="name@example.com" />
            </div>
            <button className="btn-gold" type="submit">Log request</button>
          </form>
        </div>
      </div>
    </>
  );
}
