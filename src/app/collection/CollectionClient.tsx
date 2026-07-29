"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./page.css";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default function CollectionClient({ products }: { products: any[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // The vanilla JS is injected here to run the exact FLIP from the prototype.
    // It assumes specific DOM structure and classes.
    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE_OUT  = "cubic-bezier(0.22, 1, 0.36, 1)";
    const EASE_MASK = "cubic-bezier(0.16, 1, 0.30, 1)";
    const DUR_MOVE = 900, DUR_WIPE = 900, LOAD_MS = 760;

    const grid    = document.querySelector('[data-od-id="collection-grid"]');
    const skel    = document.querySelector('[data-od-id="grid-loading"]');
    const empty   = document.querySelector('[data-od-id="collection-empty"]');
    const fillVert= grid?.querySelector('[data-filler="vert"]');
    const fillNote= grid?.querySelector('[data-filler="note"]');
    if (!grid || !skel || !empty) return;
    
    const cards   = Array.prototype.slice.call(grid.querySelectorAll("[data-attar]"));
    const chips   = Array.prototype.slice.call(document.querySelectorAll(".chip"));
    const originF = document.getElementById("f-origin") as HTMLInputElement;
    const longF   = document.getElementById("f-long") as HTMLInputElement;
    const shownEl = document.querySelector("[data-shown]");
    const noteEl  = document.querySelector("[data-state-note]");

    let state = { family: null as string | null, conc: null as string | null, origin: "", long: 0 };

    function concBand(v: number) { return v <= 18 ? "low" : (v <= 24 ? "mid" : "high"); }

    function matches(el: Element, s: any) {
      if (s.family && el.getAttribute("data-family") !== s.family) return false;
      if (s.conc && concBand(parseFloat(el.getAttribute("data-conc") || "0")) !== s.conc) return false;
      if (s.origin) {
        let o = (el.getAttribute("data-origin")||"").toLowerCase();
        if (o.indexOf(s.origin.toLowerCase().trim()) === -1) return false;
      }
      if (s.long && parseFloat(el.getAttribute("data-long") || "0") < s.long) return false;
      return true;
    }

    function countWith(over: any) {
      let s = { family: state.family, conc: state.conc, origin: state.origin, long: state.long } as any;
      for (let k in over) { if (Object.prototype.hasOwnProperty.call(over, k)) s[k] = over[k]; }
      return cards.filter(function (el) { return matches(el, s); }).length;
    }

    function paintCounts() {
      chips.forEach(function (chip) {
        let group = chip.getAttribute("data-filter") as string;
        let value = chip.getAttribute("data-value") as string;
        let over = {} as any; over[group] = value;
        let n = countWith(over);
        const countSpan = chip.querySelector("[data-count]");
        if (countSpan) countSpan.textContent = n < 10 ? "0" + n : String(n);
        chip.setAttribute("data-empty", n === 0 && chip.getAttribute("aria-pressed") !== "true" ? "true" : "false");
      });

      const el_family = document.querySelector('[data-tally="family"]');
      const el_conc = document.querySelector('[data-tally="conc"]');
      const el_origin = document.querySelector('[data-tally="origin"]');
      const el_long = document.querySelector('[data-tally="long"]');
      
      if(el_family) el_family.textContent = pad(countWith({ family: state.family }));
      if(el_conc) el_conc.textContent   = pad(countWith({ conc: state.conc }));
      if(el_origin) el_origin.textContent = pad(countWith({ origin: state.origin }));
      if(el_long) el_long.textContent   = pad(countWith({ long: state.long }));

      let oHint = document.querySelector('[data-hint="origin"]');
      if(oHint) oHint.textContent = state.origin
        ? pad(countWith({ origin: state.origin })) + " of " + pad(cards.length) + " drawn from “" + state.origin.trim() + "”"
        : "Sylhet · Taif · Mysore · Andalusia · Gujarat · Kashmir";

      const longHint = document.querySelector('[data-hint="long"]');
      if(longHint) longHint.textContent =
        "At least " + state.long.toFixed(1).replace(/\.0$/, "") + " h on skin · " +
        pad(countWith({ long: state.long })) + " of " + pad(cards.length);
    }

    function pad(n: number) { return n < 10 ? "0" + n : String(n); }

    function relayout(visible: any[]) {
      visible.forEach(function (el: any, i: number) {
        el.classList.remove("col-2", "col-3");
        el.classList.add(i === 0 ? "col-3" : "col-2");
      });
      cards.forEach(function (el: any) {
        el.classList.toggle("is-out", visible.indexOf(el) === -1);
      });

      let units = visible.length ? 3 + 2 * (visible.length - 1) : 0;
      let fill = visible.length ? (6 - (units % 6)) % 6 : 0;

      [fillVert, fillNote].forEach(function (el: any) {
        if(!el) return;
        el.hidden = true;
        el.classList.remove("col-1", "col-2", "col-3", "col-4", "col-5");
      });

      if (fill > 0) {
        let el = (fill <= 2 ? fillVert : fillNote) as any;
        if(el) {
          el.classList.add("col-" + fill);
          el.hidden = false;
        }
      }
      (empty as any).hidden = visible.length !== 0;
    }

    function boxes() {
      let m = new Map();
      Array.prototype.forEach.call(grid?.children || [], function (el) {
        if (el.hidden || el.classList.contains("is-out")) return;
        m.set(el, el.getBoundingClientRect());
      });
      return m;
    }

    function transition(mutate: () => void) {
      if (REDUCED) { mutate(); return; }
      let first = boxes();
      mutate();
      let last = boxes();

      last.forEach(function (a, el) {
        let b = first.get(el);
        if (!b) {
          el.animate(
            [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }],
            { duration: DUR_WIPE, easing: EASE_MASK }
          );
          return;
        }
        let dx = b.left - a.left, dy = b.top - a.top;
        let widthChanged = Math.abs(b.width - a.width) > 1;

        if (widthChanged) {
          el.animate(
            [{ clipPath: "inset(0 100% 0 0)", transform: "translate(" + dx + "px," + dy + "px)" },
             { clipPath: "inset(0 0 0 0)", transform: "translate(0px, 0px)" }],
            { duration: DUR_WIPE, easing: EASE_MASK }
          );
        } else if (dx || dy) {
          el.animate(
            [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "translate(0px, 0px)" }],
            { duration: DUR_MOVE, easing: EASE_OUT }
          );
        }
      });
    }

    function apply() {
      let visible = cards.filter(function (el) { return matches(el, state); });
      transition(function () { relayout(visible); });

      if(shownEl) shownEl.textContent = pad(visible.length);
      if(noteEl) {
          const defaultTotal = pad(cards.length);
          noteEl.textContent = visible.length === 0
            ? "The reading returns nothing"
            : (state.family || state.conc || state.origin || state.long
                ? `Filtered reading · ${defaultTotal} total`
                : `All open`);
      }
      paintCounts();
    }

    function load(then: () => void) {
      (skel as any).hidden = false;
      (grid as any).hidden = true;
      grid?.setAttribute("aria-busy", "true");
      window.setTimeout(function () {
        (skel as any).hidden = true;
        (grid as any).hidden = false;
        grid?.setAttribute("aria-busy", "false");
        if (then) then();
      }, REDUCED ? 0 : LOAD_MS);
    }

    const clickChips = (e: any) => {
        const chip = e.currentTarget;
        let group = chip.getAttribute("data-filter");
        let value = chip.getAttribute("data-value");
        let on = (state as any)[group] === value;
        (state as any)[group] = on ? null : value;
        chips.forEach(function (c: any) {
            if (c.getAttribute("data-filter") !== group) return;
            c.setAttribute("aria-pressed", String(!on && c === chip));
        });
        apply();
    };

    chips.forEach((c: any) => c.addEventListener('click', clickChips));

    let typing: any;
    const originFn = () => {
        window.clearTimeout(typing);
        typing = window.setTimeout(function () { state.origin = originF.value; apply(); }, 180);
    };
    if(originF) originF.addEventListener('input', originFn);
    
    const longFn = () => {
        state.long = parseFloat(longF.value) || 0;
        apply();
    };
    if(longF) longF.addEventListener('input', longFn);

    const clearFn = () => {
        state = { family: null, conc: null, origin: "", long: 0 };
        chips.forEach(function (c: any) { c.setAttribute("aria-pressed", "false"); });
        if(originF) originF.value = "";
        if(longF) longF.value = "0";
        apply();
    };
    const reloadFn = () => load(apply);

    const btnClear = document.querySelector('[data-action="clear"]');
    const btnReload = document.querySelector('[data-action="reload"]');
    if(btnClear) btnClear.addEventListener("click", clearFn);
    if(btnReload) btnReload.addEventListener("click", reloadFn);

    relayout(cards.slice());
    paintCounts();
    load(apply);

    return () => {
        chips.forEach((c: any) => c.removeEventListener('click', clickChips));
        if(originF) originF.removeEventListener('input', originFn);
        if(longF) longF.removeEventListener('input', longFn);
        if(btnClear) btnClear.removeEventListener('click', clearFn);
        if(btnReload) btnReload.removeEventListener('click', reloadFn);
    };
  }, []);

  return (
    <main id="content" data-od-id="page-collection">
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
                <span className="filt__tally num" data-tally="family">6</span>
              </div>
              <hr />
              <div className="chips" role="group" aria-labelledby="lg-family">
                <button className="chip" type="button" aria-pressed="false" data-filter="family" data-value="Woody">Woody <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="family" data-value="Floral">Floral <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="family" data-value="Resinous">Resinous <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="family" data-value="Musky">Musky <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="family" data-value="Spiced">Spiced <b data-count>0</b></button>
              </div>
            </div>

            <div className="filt" data-od-id="filter-concentration">
              <div className="filt__head">
                <span className="filt__legend" id="lg-conc">Concentration</span>
                <span className="filt__tally num" data-tally="conc">6</span>
              </div>
              <hr />
              <div className="chips" role="group" aria-labelledby="lg-conc">
                <button className="chip" type="button" aria-pressed="false" data-filter="conc" data-value="low">16 — 18% <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="conc" data-value="mid">19 — 24% <b data-count>0</b></button>
                <button className="chip" type="button" aria-pressed="false" data-filter="conc" data-value="high">25% and over <b data-count>0</b></button>
              </div>
            </div>

            <div className="filt" data-od-id="filter-origin">
              <div className="filt__head">
                <label className="filt__legend" htmlFor="f-origin">Origin</label>
                <span className="filt__tally num" data-tally="origin">6</span>
              </div>
              <hr />
              <div className="field">
                <input className="field__input" id="f-origin" type="text" autoComplete="off" placeholder="Sylhet, Taif, Mysore…" data-filter="origin" />
                <span className="field__hint" data-hint="origin">Sylhet · Taif · Mysore · Andalusia · Gujarat · Kashmir</span>
              </div>
            </div>

            <div className="filt" data-od-id="filter-longevity">
              <div className="filt__head">
                <label className="filt__legend" htmlFor="f-long">Longevity</label>
                <span className="filt__tally num" data-tally="long">6</span>
              </div>
              <hr />
              <div className="field">
                <input className="range" id="f-long" type="range" min="0" max="10" step="0.5" defaultValue="0" data-filter="long" aria-describedby="f-long-read" />
                <div className="range__scale"><span>0 h</span><span>5 h</span><span>10 h</span></div>
                <span className="field__hint" id="f-long-read" data-hint="long">At least 0 h on skin</span>
              </div>
            </div>

            <div className="rail__actions">
              <button className="link-under" type="button" data-action="clear">Clear the reading</button>
              <button className="link-under" type="button" data-action="reload">Re-read the archive</button>
            </div>
          </form>

          {/* ---------- Grid ---------- */}
          <div className="coll__grid-wrap" ref={gridRef}>
            <p className="state-line" data-od-id="grid-state">
              <span>Showing <b className="num" data-shown>--</b> of <span className="num">{String(products.length).padStart(2, '0')}</span> attars</span>
              <span data-state-note>Updating...</span>
            </p>

            {/* loading */}
            <div className="skel" data-od-id="grid-loading" aria-hidden="true" hidden>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
              <div className="skel__cell"><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i><i className="skel__bar"></i></div>
            </div>

            <div className="grid-hair" data-od-id="collection-grid" aria-live="polite" aria-busy="false" style={{ minHeight: '400px' }}>
              {products.map((p, i) => {
                const hasImage = p.images && p.images.length > 0;
                const imageUrl = hasImage ? p.images[0].blob_url : null;
                const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;
                const concStr = p.concentration ? p.concentration.replace(/[^0-9]/g, '') : "20";

                return (
                  <Link key={p.id} className="six__card col-2" href={`/product/${p.slug}`} data-attar="true" 
                    data-family={p.family || "Woody"} 
                    data-conc={concStr} 
                    data-origin={p.origin || "Sylhet, Bangladesh"} 
                    data-long={p.longevity || "8"}>
                    <span className="six__index num">{String(i + 1).padStart(2, '0')} · Batch {p.sku || '041'}</span>
                    <div>
                      {imageUrl ? (
                        <div style={{ position: 'relative', width: '28px', height: '52px', mixBlendMode: 'multiply' }} aria-hidden="true">
                          <Image src={imageUrl} alt={altText} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_URL} />
                        </div>
                      ) : (
                        <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
                      )}
                      <h3 className="six__name">{p.name}</h3>
                      <div className="six__spec">
                        <span>Family · <b>{p.family || 'Woody'}</b></span>
                        <span>Concentration · <b>{p.concentration || '24%'}</b></span>
                        <span>Origin · <b>{p.origin || 'Sylhet, Bangladesh'}</b></span>
                        <span>Longevity · <b>{p.longevity ? Math.max(parseFloat(p.longevity), 0.1) : 8} h</b></span>
                      </div>
                    </div>
                    <div className="six__foot">
                      <span className="label">{p.size} vial</span>
                      <span className="six__price">{p.currency} {p.price.toString()}</span>
                    </div>
                  </Link>
                );
              })}

              <div className="six__cell six__cell--vert" data-od-id="six-archive-note" data-filler="vert" hidden>
                <span className="eyebrow">Archive 036 — 044</span>
              </div>

              <div className="six__cell col-5" data-od-id="six-process-note" data-filler="note" hidden>
                <p className="label">One process</p>
                <p className="lead">Distilled or expressed, cut into a single carrier oil, rested forty days in the dark. No ethanol, no fixative, no batch larger than sixty vials.</p>
              </div>

              <div className="six__cell empty col-6" data-od-id="collection-empty" hidden>
                <p className="eyebrow">No match in the archive</p>
                <h3>Nothing in the collection answers that reading.</h3>
                <p className="lead">Loosen one field, or let the finder read four questions and return the nearest match.</p>
                <div className="empty__rules" aria-hidden="true"><i></i><i></i><i></i></div>
                <Link className="btn-gold" href="/finder" data-od-id="empty-finder-cta">Open the finder</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
