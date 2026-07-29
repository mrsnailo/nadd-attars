'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const COORDS: Record<string, { w: number, x: number, y: number, z: number }> = {
  'malik-oud': { w: 88, x: 92, y: 78, z: 71 },
  'zafaran-oud': { w: 76, x: 80, y: 64, z: 66 },
  'anbar': { w: 84, x: 88, y: 52, z: 63 },
  'mysore-sandal': { w: 72, x: 64, y: 38, z: 41 },
  'taif-rose': { w: 46, x: 58, y: 24, z: 54 },
  'musk-abyad': { w: 28, x: 36, y: 30, z: 35 },
};

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

function getPts(v0: number, v1: number, v2: number, v3: number) {
  const r = [v0, v1, v2, v3, 100 - v0, 100 - v1, 100 - v2, 100 - v3];
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * Math.PI / 180;
    const px = r[i] * Math.sin(a);
    const py = -r[i] * Math.cos(a);
    pts.push(px.toFixed(1) + "," + py.toFixed(1));
  }
  return pts.join(" ");
}

const WORDS = ["far toward", "toward", "leaning", "balanced", "leaning", "toward", "far toward"];

function getPhrase(val: number, low: string, high: string) {
  const band = Math.min(6, Math.floor(val / (100 / 7)));
  if (band === 3) return "balanced between " + low + " and " + high;
  return WORDS[band] + " " + (band < 3 ? low : high);
}

export default function FinderClient({ products }: { products: any[] }) {
  const [axes, setAxes] = useState({ w: 50, x: 50, y: 50, z: 50 });
  const listRef = useRef<HTMLUListElement>(null);
  
  const { w, x, y, z } = axes;
  const matches = products.filter(p => COORDS[p.slug]).map(p => {
    const coords = COORDS[p.slug];
    const d = Math.sqrt(Math.pow(w - coords.w, 2) + Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2) + Math.pow(z - coords.z, 2));
    const s = Math.max(0, 100 * (1 - (d / 200)));
    return { product: p, d, s };
  });

  matches.sort((a, b) => a.d - b.d);
  
  const isTie = matches.length >= 2 && Math.abs(matches[0].d - matches[1].d) <= 6;
  
  const tieBreakerId = 'discovery-set';
  
  const computeOrder = () => {
    let ids = [];
    if (isTie) {
      ids.push(tieBreakerId);
      ids.push(...matches.map(m => m.product.id));
    } else {
      ids = matches.map(m => m.product.id);
    }
    return ids;
  };

  const newOrderIds = computeOrder();
  const currentOrderKey = newOrderIds.join(',');

  const prevOrderKey = useRef(currentOrderKey);
  const firstBoxes = useRef<Map<string, DOMRect>>(new Map());

  // Use a hacky manual invocation for snapshotting before re-render because React doesn't expose getSnapshotBeforeUpdate in hooks 
  // without jumping through hoops. But since `axes` is the only trigger, we can just measure inside an event handler OR a layout effect that runs sync.
  // Actually, standard Flip with hooks: measure in the render phase? No, DOM not updated. 
  // We can measure in a layout effect BEFORE the next layout effect? No.
  // The simplest reliable way in React: we use a two-step state or we measure BEFORE updating the state manually.
  
  const handleSliderChange = (axisId: string, val: number) => {
    if (listRef.current) {
      const items = Array.from(listRef.current.children) as HTMLElement[];
      firstBoxes.current = new Map();
      items.forEach(el => firstBoxes.current.set(el.id, el.getBoundingClientRect()));
    }
    setAxes(a => ({ ...a, [axisId]: val }));
  };

  useLayoutEffect(() => {
    if (prevOrderKey.current !== currentOrderKey && listRef.current) {
      const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!REDUCED) {
        const items = Array.from(listRef.current.children) as HTMLElement[];
        items.forEach(el => {
          const first = firstBoxes.current.get(el.id);
          const last = el.getBoundingClientRect();
          if (first && first.top !== last.top) {
            const dy = first.top - last.top;
            el.animate([
              { transform: `translateY(${dy}px)` },
              { transform: "translateY(0)" }
            ], { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
          }
        });
      }
    }
    prevOrderKey.current = currentOrderKey;
  }, [currentOrderKey]);

  return (
    <div className="wrap border-box" style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '40px' }}>
      <section className="section section--tight" data-od-id="finder-head">
        <div className="head" style={{ display: 'grid', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
          <p className="eyebrow" data-motion="mask">Finder</p>
          <div className="head__row" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--s-7)', flexWrap: 'wrap' }}>
            <h1 data-motion="mask">Calibrate the instrument.</h1>
            <p className="lead head__note" style={{ maxWidth: '38ch' }}>
              Map a scent by four axes. The archive reorders to match the profile you draw in real time.
            </p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>
      </section>

      <section className="section">
        <div className="finder">
          <form className="finder__calib" onSubmit={e => e.preventDefault()}>
            <div className="radar" style={{ width: '100%', aspectRatio: '1/1', userSelect: 'none' }}>
              <svg viewBox="-150 -150 300 300" aria-hidden="true" focusable="false">
                <circle cx="0" cy="0" r="100" className="radar__grid" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
                <circle cx="0" cy="0" r="75" className="radar__grid" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
                <circle cx="0" cy="0" r="50" className="radar__grid" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
                <circle cx="0" cy="0" r="25" className="radar__grid" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
                
                <line x1="0" y1="-100" x2="0" y2="100" className="radar__axis" stroke="var(--rule-strong)" strokeWidth="1" />
                <line x1="-100" y1="0" x2="100" y2="0" className="radar__axis" stroke="var(--rule-strong)" strokeWidth="1" />
                <line x1="-70.7" y1="-70.7" x2="70.7" y2="70.7" className="radar__axis" stroke="var(--rule-strong)" strokeWidth="1" />
                <line x1="-70.7" y1="70.7" x2="70.7" y2="-70.7" className="radar__axis" stroke="var(--rule-strong)" strokeWidth="1" />

                <text x="0" y="-115" className="radar__label" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Warm</text>
                <text x="82" y="-82" className="radar__label" textAnchor="start" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Heavy</text>
                <text x="115" y="4" className="radar__label" textAnchor="start" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Smoky</text>
                <text x="82" y="90" className="radar__label" textAnchor="start" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Projecting</text>
                <text x="0" y="125" className="radar__label" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Fresh</text>
                <text x="-82" y="90" className="radar__label" textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Light</text>
                <text x="-115" y="4" className="radar__label" textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Sweet</text>
                <text x="-82" y="-82" className="radar__label" textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fill: 'var(--muted)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>Intimate</text>

                <polygon id="poly-user" points={getPts(w, x, y, z)} style={{ fill: 'color-mix(in oklch, var(--gold) 15%, transparent)', stroke: 'var(--gold-edge)', strokeWidth: '1.5', transition: 'all 0.1s linear' }} />
              </svg>
            </div>

            <div className="calib__sliders" style={{ display: 'grid', gap: 'var(--s-7)' }}>
              {[
                { id: 'w', labelF: 'Fresh', labelT: 'Warm', val: w },
                { id: 'x', labelF: 'Light', labelT: 'Heavy', val: x },
                { id: 'y', labelF: 'Sweet', labelT: 'Smoky', val: y },
                { id: 'z', labelF: 'Intimate', labelT: 'Projecting', val: z }
              ].map(axis => (
                <div className="calib__group" key={axis.id} style={{ display: 'grid', gap: 'var(--s-3)' }}>
                  <div className="calib__axis-read" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--t-micro)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--fg)' }}>
                    <span>{axis.labelF}</span><span>{axis.labelT}</span>
                  </div>
                  <input 
                    className="range calib-range" 
                    type="range" 
                    min="0" max="100" 
                    value={axis.val} 
                    aria-label={`${axis.labelF} to ${axis.labelT}`}
                    aria-valuetext={getPhrase(axis.val, axis.labelF, axis.labelT)}
                    onChange={e => handleSliderChange(axis.id, parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </form>

          <ul className="finder__results" id="results-list" aria-live="polite" ref={listRef} style={{ display: 'grid' }}>
            {isTie && (
              <li className="match is-rank-1" id={tieBreakerId}>
                 <div className="match__head" style={{ display: 'grid', gap: 'var(--s-2)' }}>
                  <span className="eyebrow match__rank-label"></span>
                  <h2 className="six__name">Discovery Set</h2>
                </div>
                <div className="match__expand">
                  <div className="vial vial--sm match__vial" aria-hidden="true">
                    <div style={{ position: 'relative', width: '56px', height: '104px', display: 'flex', alignItems: 'flex-end', gap: '2px', marginLeft: '12px' }}>
                      <span className="vial__cap" style={{position:'absolute'}}></span><span className="vial__neck" style={{position:'absolute'}}></span><span className="vial__body" style={{position:'absolute'}}></span>
                    </div>
                  </div>
                  <div className="match__data" style={{ display: 'grid', gap: 'var(--s-5)', alignContent: 'start', flex: 1 }}>
                    <div className="six__spec" style={{ display: 'grid', gap: 'var(--s-2)', fontSize: 'var(--t-small)', color: 'var(--muted)' }}>
                      <span><b>Balanced Match</b></span>
                      <span>Your profile sits closely between two families. We recommend experiencing the extremes.</span>
                    </div>
                    <div className="six__foot" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--s-4)' }}>
                      <span className="label">6 × 1 ml vials</span>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                        <span className="six__price">৳ 9,100</span>
                        <Link className="link-under" href="/collection">View Set</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )}
            
            {matches.map((m, idx) => {
              const p = m.product;
              const hasImage = p.images && p.images.length > 0;
              const imageUrl = hasImage ? p.images[0].blob_url : null;
              const rank = isTie ? (idx === 0 || idx === 1 ? 'is-rank-2' : 'is-rank-other') : (idx === 0 ? 'is-rank-1' : idx === 1 ? 'is-rank-2' : 'is-rank-other');
              
              return (
                <li className={`match ${rank}`} id={`attar-${p.id}`} key={p.id}>
                  <div className="match__head" style={{ display: 'grid', gap: 'var(--s-2)' }}>
                    <span className="eyebrow match__rank-label"></span>
                    <h2 className="six__name">{p.name}</h2>
                  </div>
                  <div className="match__expand">
                    <div className="vial vial--sm match__vial" aria-hidden="true" style={{ position: 'relative' }}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt={p.name} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_URL} />
                      ) : (
                        <><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></>
                      )}
                    </div>
                    <div className="match__data" style={{ display: 'grid', gap: 'var(--s-5)', alignContent: 'start', flex: 1 }}>
                      <div className="six__spec" style={{ display: 'grid', gap: 'var(--s-2)', fontSize: 'var(--t-small)', color: 'var(--muted)' }}>
                        <span>Family · <b style={{ fontWeight: 'var(--w-body-regular)', color: 'var(--fg)' }}>{p.family}</b></span>
                        {p.notes && p.notes.length > 0 && <span>Base · <b style={{ fontWeight: 'var(--w-body-regular)', color: 'var(--fg)' }}>{p.notes.map((n: any) => n.ingredient).join(', ')}</b></span>}
                      </div>
                      <div className="six__foot" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--s-4)' }}>
                        <span className="label">3 ml vial</span>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                          <span className="six__price">{p.currency} {p.price}</span>
                          <Link className="link-under" href={`/product/${p.slug}`}>View Dossier</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="match__perf" style={{ marginTop: 'var(--s-4)', display: 'grid', gridTemplateColumns: rank !== 'is-rank-other' ? '110px minmax(0, 1fr)' : 'minmax(0,1fr)', gap: 'var(--s-6)', alignItems: 'center' }}>
                    <div className="perf__label eyebrow" style={{ display: rank === 'is-rank-other' ? 'none' : 'block' }}>Match</div>
                    <div className="perf__scale" style={{ position: 'relative', height: '32px', borderBottom: 'var(--line-light)' }}>
                      <i style={{ position: 'absolute', bottom: 0, width: 'var(--hairline)', height: '9px', background: 'var(--rule-strong)', left: 0 }}></i>
                      <i style={{ position: 'absolute', bottom: 0, width: 'var(--hairline)', height: '9px', background: 'var(--rule-strong)', left: '25%' }}></i>
                      <i style={{ position: 'absolute', bottom: 0, width: 'var(--hairline)', height: '9px', background: 'var(--rule-strong)', left: '50%' }}></i>
                      <i style={{ position: 'absolute', bottom: 0, width: 'var(--hairline)', height: '9px', background: 'var(--rule-strong)', left: '75%' }}></i>
                      <i style={{ position: 'absolute', bottom: 0, width: 'var(--hairline)', height: '9px', background: 'var(--rule-strong)', left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar match-bar" style={{ position: 'absolute', left: 0, bottom: 0, height: '10px', width: `${Math.round(m.s)}%`, background: 'var(--gold-ink)', transition: 'width 0.1s linear' }}></span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
