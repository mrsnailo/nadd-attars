'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

type Product = any; // Will pass the whole product array

function concBand(v: number) {
  return v <= 18 ? "low" : (v <= 24 ? "mid" : "high");
}

export default function CollectionClient({ initialProducts }: { initialProducts: Product[] }) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    family: null as string | null,
    conc: null as string | null,
    origin: "",
    long: 0
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const skelRef = useRef<HTMLDivElement>(null);

  // We'll run loading state on mount
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loadMs = reduced ? 0 : 760;
    const timer = setTimeout(() => {
      setLoading(false);
    }, loadMs);
    return () => clearTimeout(timer);
  }, []);

  // Compute matches
  const matches = (p: Product, s: typeof state) => {
    if (s.family && p.family !== s.family) return false;
    
    // Parse concentration (assuming it starts with number)
    const concMatch = p.concentration ? p.concentration.match(/^(\d+(\.\d+)?)/) : null;
    const conc = concMatch ? parseFloat(concMatch[1]) : 0;
    if (s.conc && concBand(conc) !== s.conc) return false;
    
    if (s.origin) {
      const o = (p.origin || "").toLowerCase();
      if (o.indexOf(s.origin.toLowerCase().trim()) === -1) return false;
    }
    
    const longMatch = p.metrics?.longevity ? p.metrics.longevity.match(/^(\d+(\.\d+)?)/) : null;
    const longVal = longMatch ? parseFloat(longMatch[1]) : 0;
    if (s.long && longVal < s.long) return false;
    
    return true;
  };

  const countWith = (overrides: Partial<typeof state>) => {
    const s = { ...state, ...overrides };
    return initialProducts.filter(p => matches(p, s)).length;
  };

  const families = ["Woody", "Floral", "Resinous", "Musky", "Spiced"];
  const concs = [
    { label: "16 — 18%", val: "low" },
    { label: "19 — 24%", val: "mid" },
    { label: "25% and over", val: "high" }
  ];

  const visibleProducts = initialProducts.filter(p => matches(p, state));
  const pad = (n: number) => n < 10 ? "0" + n : String(n);

  // FLIP animation
  // Since we conditionally change layout classes directly on render, we need to capture boxes before and after.
  // We can do this in useLayoutEffect, but we only want to animate when exactly state changes.
  // The simplest way to handle WAAPI FLIP in React is to measure BEFORE the update (in the event handler),
  // but since state is managed by React, we measure in useLayoutEffect before the paint? No, we must measure before React commits!
  // Alternatively, just use the old vanilla script structure inside a useEffect if we keep DOM nodes.
  // Actually, we can use `getSnapshotBeforeUpdate` via a hook or just keep a ref of previous rects.
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (REDUCED) return;
    
    const EASE_OUT  = "cubic-bezier(0.22, 1, 0.36, 1)";
    const EASE_MASK = "cubic-bezier(0.16, 1, 0.30, 1)";
    const DUR_MOVE = 900, DUR_WIPE = 900;
    
    const currentRects = new Map<string, DOMRect>();
    
    Array.from(grid.children).forEach((el) => {
      const element = el as HTMLElement;
      if (element.hidden || element.classList.contains("is-out")) return;
      const id = element.getAttribute("data-id");
      if (id) {
        currentRects.set(id, element.getBoundingClientRect());
      }
    });

    Array.from(grid.children).forEach((el) => {
      const element = el as HTMLElement;
      if (element.hidden || element.classList.contains("is-out")) return;
      
      const id = element.getAttribute("data-id");
      if (!id) return;
      
      const before = prevRects.current.get(id);
      const after = currentRects.get(id);
      
      if (!after) return;
      
      if (!before) {
        element.animate(
          [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }],
          { duration: DUR_WIPE, easing: EASE_MASK }
        );
        return;
      }
      
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      const widthChanged = Math.abs(before.width - after.width) > 1;
      
      if (widthChanged) {
        element.animate(
          [{ clipPath: "inset(0 100% 0 0)", transform: `translate(${dx}px,${dy}px)` },
           { clipPath: "inset(0 0 0 0)", transform: "translate(0px, 0px)" }],
          { duration: DUR_WIPE, easing: EASE_MASK }
        );
      } else if (dx || dy) {
        element.animate(
          [{ transform: `translate(${dx}px,${dy}px)` }, { transform: "translate(0px, 0px)" }],
          { duration: DUR_MOVE, easing: EASE_OUT }
        );
      }
    });

    // Save for next render
    prevRects.current = currentRects;
  }, [state, loading]); // Need to run whenever layout might change

  // A trick to measure before updates: update state by first measuring
  const triggerUpdate = (newStateUpdater: (prev: typeof state) => typeof state) => {
    // Measure right before state changes
    const grid = gridRef.current;
    if (grid) {
      const rects = new Map<string, DOMRect>();
      Array.from(grid.children).forEach((el) => {
        const element = el as HTMLElement;
        if (!element.hidden && !element.classList.contains("is-out")) {
          const id = element.getAttribute("data-id");
          if (id) rects.set(id, element.getBoundingClientRect());
        }
      });
      prevRects.current = rects;
    }
    
    // Check if we need to load
    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (newStateUpdater === null) {
        // Direct update via manual call
    } else {
        setState(newStateUpdater);
    }
  };

  const handleToggleFamily = (val: string) => triggerUpdate(s => ({ ...s, family: s.family === val ? null : val }));
  const handleToggleConc = (val: string) => triggerUpdate(s => ({ ...s, conc: s.conc === val ? null : val }));
  const handleOrigin = (val: string) => triggerUpdate(s => ({ ...s, origin: val }));
  const handleLongevity = (val: number) => triggerUpdate(s => ({ ...s, long: val }));

  const clearFilters = () => triggerUpdate(s => ({ family: null, conc: null, origin: "", long: 0 }));
  const reloadGrid = () => {
    setLoading(true);
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => setLoading(false), reduced ? 0 : 760);
  };

  const isFiltered = state.family || state.conc || state.origin || state.long;

  // Let's compute grid layout classes for visible products
  const visibleCount = visibleProducts.length;
  const units = visibleCount ? 3 + 2 * (visibleCount - 1) : 0;
  const fill = visibleCount ? (6 - (units % 6)) % 6 : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* ---------- Shared with index.html: head, card, vial, filler cell ---------- */
        .head { display: grid; gap: var(--s-4); margin-bottom: var(--s-8); }
        .head__row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-7); flex-wrap: wrap; }
        .head__note { max-width: 38ch; }
        .col-1 { grid-column: span 1; }
        .col-2 { grid-column: span 2; }
        .col-3 { grid-column: span 3; }
        .col-4 { grid-column: span 4; }
        .col-5 { grid-column: span 5; }
        .col-6 { grid-column: span 6; }

        .six__cell { display: grid; align-content: end; gap: var(--s-3); padding: var(--s-6); }
        .six__cell p { max-width: 52ch; }
        .six__cell--vert { writing-mode: vertical-rl; align-content: center; justify-content: center; }

        /* ---------- Page shell: rail + grid ---------- */
        .coll {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: var(--s-10);
          align-items: start;
        }
        .coll__rail { position: sticky; top: calc(var(--nav-h) + var(--s-6)); display: grid; gap: var(--s-8); }
        .coll__grid-wrap { position: relative; }

        /* ---------- Filters — typographic, no select chrome ---------- */
        .filt { display: grid; gap: var(--s-4); }
        .filt__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-4); }
        .filt__legend {
          font-size: var(--t-micro); font-weight: var(--w-body-medium);
          letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--fg);
        }
        .filt__tally { font-family: var(--font-mono); font-size: var(--t-micro); color: var(--muted); }
        .filt hr { border: 0; border-top: var(--line-light); }

        /* Filter chip — a word with a hairline under it. Gold only when it is holding. */
        .chips { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); }
        .chip {
          display: inline-flex; align-items: baseline; gap: var(--s-2);
          padding-bottom: var(--s-2);
          border-bottom: var(--hairline) solid transparent;
          font-size: var(--t-small);
          color: var(--muted);
          transition: color var(--dur-1) var(--ease-out), border-color var(--dur-2) var(--ease-out);
          cursor: pointer;
          background: none;
        }
        .chip b { font-family: var(--font-mono); font-size: var(--t-micro); font-weight: var(--w-body-regular); }
        .chip:hover { color: var(--fg); border-bottom-color: var(--rule-strong); }
        .chip[aria-pressed="true"] { color: var(--gold-ink); border-bottom-color: var(--gold-ink); }
        .chip[data-empty="true"] { color: var(--rule-strong); }
        .chip[data-empty="true"]:hover { border-bottom-color: transparent; }

        /* Underline field — label above, hairline under, nothing else. */
        .field { display: grid; gap: var(--s-3); }
        .field__input {
          width: 100%;
          padding-bottom: var(--s-3);
          border-bottom: var(--hairline) solid var(--rule-strong);
          font-size: var(--t-body);
          color: var(--fg);
          background: none;
          border-left: 0; border-right: 0; border-top: 0;
          transition: border-color var(--dur-2) var(--ease-out);
        }
        .field__input::placeholder { color: var(--muted); }
        .field__input:focus { outline: 0; border-bottom-color: var(--gold-ink); }
        .field__hint { font-family: var(--font-mono); font-size: var(--t-micro); color: var(--muted); }

        /* Longevity — the same hairline, read as a scale. */
        .range { width: 100%; height: 22px; appearance: none; background: none; cursor: pointer; border: 0; padding: 0; }
        .range::-webkit-slider-runnable-track { height: var(--hairline); background: var(--rule-strong); border: 0; }
        .range::-moz-range-track { height: var(--hairline); background: var(--rule-strong); border: 0;}
        .range::-webkit-slider-thumb {
          appearance: none; width: 2px; height: 20px; margin-top: -10px;
          background: var(--gold-ink); border: 0; border-radius: var(--radius);
        }
        .range::-moz-range-thumb { width: 2px; height: 20px; background: var(--gold-ink); border: 0; border-radius: var(--radius); }
        .range:focus-visible { outline: var(--hairline) solid var(--gold-edge); outline-offset: 4px; }
        .range__scale { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: var(--t-micro); color: var(--muted); }

        .rail__actions { display: grid; gap: var(--s-4); justify-items: start; padding-top: var(--s-5); border-top: var(--line-light); }
        .link-under {
          padding-bottom: var(--s-2);
          border-bottom: var(--hairline) solid var(--rule-strong);
          font-size: var(--t-micro); letter-spacing: var(--ls-label); text-transform: uppercase;
          color: var(--muted); cursor: pointer; background: none; border-left: 0; border-right: 0; border-top: 0;
          transition: color var(--dur-1) var(--ease-out), border-color var(--dur-2) var(--ease-out);
        }
        .link-under:hover { color: var(--gold-ink); border-bottom-color: var(--gold-ink); }

        /* ---------- Grid state line ---------- */
        .state-line {
          display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-5);
          flex-wrap: wrap; max-width: none;
          padding-bottom: var(--s-4); margin-bottom: var(--s-5);
          border-bottom: var(--line-light);
          font-family: var(--font-mono); font-size: var(--t-micro);
          letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--muted);
        }
        .state-line b { font-weight: var(--w-body-regular); color: var(--gold-ink); }

        /* ---------- Cards during a reorder ---------- */
        .six__card, .six__cell { will-change: transform; text-decoration: none; }
        .is-out { display: none !important; }

        /* ---------- Empty cell — brand voice, offers the finder ---------- */
        .empty { display: grid; gap: var(--s-4); padding: var(--s-9) var(--s-8); }
        .empty h3 { max-width: 22ch; }
        .empty p { max-width: 46ch; }
        .empty__rules { display: grid; gap: var(--s-3); margin-top: var(--s-6); max-width: 320px; }
        .empty__rules i { display: block; height: var(--hairline); background: var(--rule); }
        .empty__rules i:nth-child(2) { width: 62%; }
        .empty__rules i:nth-child(3) { width: 34%; }

        /* ---------- Loading — pulsing hairlines, no spinner ---------- */
        .skel { display: grid; grid-template-columns: repeat(var(--grid-cols), 1fr); gap: var(--grid-gap);
                background: var(--rule-strong); border: var(--hairline) solid var(--rule-strong); }
        .skel__cell { background: var(--bg); padding: var(--s-7) var(--s-6) var(--s-6); display: grid; gap: var(--s-5); align-content: start; }
        .skel__cell:nth-child(1) { grid-column: span 3; }
        .skel__cell:nth-child(2), .skel__cell:nth-child(3) { grid-column: span 2; }
        .skel__cell:nth-child(4), .skel__cell:nth-child(5) { grid-column: span 2; }
        .skel__cell:nth-child(6) { grid-column: span 3; }
        .skel__bar { display: block; height: var(--hairline); background: var(--rule-strong); animation: hair-pulse 1.9s var(--ease-inout) infinite; }
        .skel__bar:nth-child(1) { width: 34%; }
        .skel__bar:nth-child(2) { width: 78%; height: 2px; animation-delay: 0.12s; }
        .skel__bar:nth-child(3) { width: 60%; animation-delay: 0.24s; }
        .skel__bar:nth-child(4) { width: 52%; animation-delay: 0.36s; }
        .skel__bar:nth-child(5) { width: 44%; animation-delay: 0.48s; }
        .skel__cell:nth-child(even) .skel__bar { animation-delay: 0.3s; }
        @keyframes hair-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.22; } }
        
        @media (max-width: 1024px) {
          .coll { grid-template-columns: 210px minmax(0, 1fr); gap: var(--s-8); }
        }
        @media (max-width: 820px) {
          .coll { grid-template-columns: 1fr; gap: var(--s-8); }
          .coll__rail { position: static; gap: var(--s-6); }
          .col-1, .col-5 { grid-column: span 2; }
          .six__cell--vert { writing-mode: horizontal-tb; align-content: start; }
          .skel { grid-template-columns: repeat(2, 1fr); }
          .skel__cell { grid-column: span 2 !important; }
          .empty { padding: var(--s-8) var(--s-6); }
        }

        @media (prefers-reduced-motion: reduce) {
          .skel__bar { animation: none; opacity: 0.6; }
          .six__card, .six__cell { will-change: auto; }
        }
      `}} />

      {/* ============ 1. HEAD ============ */}
      <section className="section section--tight wrap" data-od-id="collection-head">
        <div className="head">
          <p className="eyebrow" data-motion="mask">The collection · Archive 036 — 044</p>
          <div className="head__row">
            <h1 data-motion="mask">Six attars, one process.</h1>
            <p className="lead head__note">Read the archive by family, concentration, origin or measured longevity. Every vial keeps its dossier; nothing here is blended from an unnamed source.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>
      </section>

      {/* ============ 2. RAIL + HAIRLINE GRID ============ */}
      <section className="section wrap" data-od-id="collection-archive">
        <div className="coll">

          {/* ---------- Left rail ---------- */}
          <form className="coll__rail" data-od-id="filter-rail" aria-label="Filter the archive" onSubmit={(e) => e.preventDefault()}>

            <div className="filt" data-od-id="filter-family">
              <div className="filt__head">
                <span className="filt__legend" id="lg-family">Family</span>
                <span className="filt__tally num" data-tally="family">{pad(countWith({family: state.family}))}</span>
              </div>
              <hr />
              <div className="chips" role="group" aria-labelledby="lg-family">
                {families.map(f => {
                  const n = countWith({ family: f });
                  const pressed = state.family === f;
                  return (
                    <button key={f} className="chip" type="button" aria-pressed={pressed} data-empty={!pressed && n === 0} onClick={() => handleToggleFamily(f)}>
                      {f} <b>{pad(n)}</b>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filt" data-od-id="filter-concentration">
              <div className="filt__head">
                <span className="filt__legend" id="lg-conc">Concentration</span>
                <span className="filt__tally num" data-tally="conc">{pad(countWith({conc: state.conc}))}</span>
              </div>
              <hr />
              <div className="chips" role="group" aria-labelledby="lg-conc">
                {concs.map(c => {
                  const n = countWith({ conc: c.val });
                  const pressed = state.conc === c.val;
                  return (
                    <button key={c.val} className="chip" type="button" aria-pressed={pressed} data-empty={!pressed && n === 0} onClick={() => handleToggleConc(c.val)}>
                      {c.label} <b>{pad(n)}</b>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filt" data-od-id="filter-origin">
              <div className="filt__head">
                <label className="filt__legend" htmlFor="f-origin">Origin</label>
                <span className="filt__tally num" data-tally="origin">{pad(countWith({origin: state.origin}))}</span>
              </div>
              <hr />
              <div className="field">
                <input className="field__input" id="f-origin" type="text" autoComplete="off"
                       placeholder="Sylhet, Taif, Mysore…"
                       value={state.origin}
                       onChange={(e) => handleOrigin(e.target.value)} />
                <span className="field__hint">
                  {state.origin ? `${pad(countWith({origin: state.origin}))} of ${pad(initialProducts.length)} drawn from “${state.origin.trim()}”` : 'Sylhet · Taif · Mysore · Andalusia · Gujarat · Kashmir'}
                </span>
              </div>
            </div>

            <div className="filt" data-od-id="filter-longevity">
              <div className="filt__head">
                <label className="filt__legend" htmlFor="f-long">Longevity</label>
                <span className="filt__tally num" data-tally="long">{pad(countWith({long: state.long}))}</span>
              </div>
              <hr />
              <div className="field">
                <input className="range" id="f-long" type="range" min="0" max="10" step="0.5" 
                       value={state.long}
                       onChange={(e) => handleLongevity(parseFloat(e.target.value))}
                       aria-describedby="f-long-read" />
                <div className="range__scale"><span>0 h</span><span>5 h</span><span>10 h</span></div>
                <span className="field__hint" id="f-long-read">
                  At least {Number(state.long.toFixed(1))} h on skin · {pad(countWith({long: state.long}))} of {pad(initialProducts.length)}
                </span>
              </div>
            </div>

            <div className="rail__actions">
              <button className="link-under" type="button" onClick={clearFilters}>Clear the reading</button>
              <button className="link-under" type="button" onClick={reloadGrid}>Re-read the archive</button>
            </div>
          </form>

          {/* ---------- Grid ---------- */}
          <div className="coll__grid-wrap">
            <p className="state-line" data-od-id="grid-state">
              <span>Showing <b className="num">{pad(visibleCount)}</b> of <span className="num">{pad(initialProducts.length)}</span> attars</span>
              <span>
                {visibleCount === 0 ? "The reading returns nothing" : (isFiltered ? "Filtered reading · batch 036 — 044" : "Batch 036 — 044 · all open")}
              </span>
            </p>

            {loading ? (
              <div className="skel" aria-hidden="true" ref={skelRef}>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
                <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              </div>
            ) : (
              <div className="grid-hair" aria-live="polite" aria-busy="false" ref={gridRef}>
                {initialProducts.map((p, rawIndex) => {
                  const isVisible = visibleProducts.includes(p);
                  const visibleIndex = visibleProducts.indexOf(p);
                  
                  // Compute dynamic column class based on original logic
                  const isFirst = visibleIndex === 0;
                  const colClass = isVisible ? (isFirst ? "col-3" : "col-2") : "";
                  const hiddenClass = isVisible ? "" : "is-out";

                  const hasImage = p.images && p.images.length > 0;
                  const imageUrl = hasImage ? p.images[0].blob_url : null;
                  const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;

                  return (
                    <Link 
                       href={`/product/${p.slug}`} 
                       className={`six__card ${colClass} ${hiddenClass}`} 
                       key={p.id}
                       data-id={p.id}
                     >
                      <span className="six__index num">{pad(rawIndex + 1)} · Batch {p.batch_no || '000'}</span>
                      <div>
                        {imageUrl ? (
                          <div style={{ position: 'relative', width: '44px', height: '130px', margin: '0 auto 16px', display: 'flex' }}>
                             <Image 
                               src={imageUrl} 
                               alt={altText} 
                               fill
                               style={{ objectFit: 'contain', objectPosition: 'bottom' }}
                               placeholder="blur"
                               blurDataURL={BLUR_URL}
                             />
                          </div>
                        ) : (
                          <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
                        )}
                        <h3 className="six__name">{p.name}</h3>
                        <div className="six__spec">
                          <span>Family · <b>{p.family}</b></span>
                          <span>Concentration · <b>{p.concentration || p.subtitle}</b></span>
                          <span>Origin · <b>{p.origin}</b></span>
                          <span>Longevity · <b>{p.metrics?.longevity}</b></span>
                        </div>
                      </div>
                      <div className="six__foot">
                        <span className="label">{p.size} · {p.stock_count || 60} drawn</span>
                        <span className="six__price">{p.currency} {p.price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                      </div>
                    </Link>
                  );
                })}

                <div 
                  className={`six__cell six__cell--vert col-${fill} ${fill <= 2 ? '' : 'is-out'}`} 
                  data-id="filler-vert"
                  hidden={visibleCount === 0 || fill > 2 || fill === 0}
                >
                  <span className="eyebrow">Archive 036 — 044</span>
                </div>

                <div 
                  className={`six__cell col-${fill} ${fill > 2 ? '' : 'is-out'}`} 
                  data-id="filler-note"
                  hidden={visibleCount === 0 || fill <= 2}
                >
                  <p className="label">One process</p>
                  <p className="lead">Distilled or expressed, cut into a single carrier oil, rested forty days in the dark. No ethanol, no fixative, no batch larger than sixty vials.</p>
                </div>

                <div 
                  className={`six__cell empty col-6 ${visibleCount === 0 ? '' : 'is-out'}`}
                  data-id="empty-state"
                  hidden={visibleCount > 0}
                >
                  <p className="eyebrow">No match in the archive</p>
                  <h3>Nothing in the six answers that reading.</h3>
                  <p className="lead">Six attars is the whole house — the archive holds no seventh to widen into. Loosen one field, or let the finder read four questions and return the nearest of the six.</p>
                  <div className="empty__rules" aria-hidden="true"><i></i><i></i><i></i></div>
                  <Link href="/finder" className="btn-gold">Open the finder</Link>
                </div>

              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
