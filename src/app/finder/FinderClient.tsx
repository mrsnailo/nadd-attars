"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import "./page.css";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

// hardcoded mapping specified in HANDOFF.md
const defaultCoordinates: Record<string, [number, number, number, number]> = {
  "malik-oud": [88, 92, 78, 71],
  "zafaran-oud": [76, 80, 64, 66],
  "anbar": [84, 88, 52, 63],
  "mysore-sandal": [72, 64, 38, 41],
  "taif-rose": [46, 58, 24, 54],
  "musk-abyad": [28, 36, 30, 35],
};

export default function FinderClient({ products }: { products: any[] }) {
  useEffect(() => {
    let REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let attars = Array.prototype.slice.call(document.querySelectorAll("[data-attar]"));
    let sliders = document.querySelectorAll(".calib-range") as NodeListOf<HTMLInputElement>;
    let list = document.getElementById("results-list");
    let polyUser = document.getElementById("poly-user");
    if(!list || !polyUser || sliders.length < 4) return;
    
    let w = 50, x = 50, y = 50, z = 50;

    function getPts(v0: number, v1: number, v2: number, v3: number) {
      let r = [v0, v1, v2, v3, 100 - v0, 100 - v1, 100 - v2, 100 - v3];
      let pts = [];
      for (let i = 0; i < 8; i++) {
        let a = (i * 45) * Math.PI / 180;
        let px = r[i] * Math.sin(a);
        let py = -r[i] * Math.cos(a);
        pts.push(px.toFixed(1) + "," + py.toFixed(1));
      }
      return pts.join(" ");
    }

    function getDistance(a: any) {
      let aw = parseFloat(a.getAttribute("data-w") || "50");
      let ax = parseFloat(a.getAttribute("data-x") || "50");
      let ay = parseFloat(a.getAttribute("data-y") || "50");
      let az = parseFloat(a.getAttribute("data-z") || "50");
      return Math.sqrt(Math.pow(w - aw, 2) + Math.pow(x - ax, 2) + Math.pow(y - ay, 2) + Math.pow(z - az, 2));
    }
    
    function getStrength(d: number) {
      return Math.max(0, 100 * (1 - (d / 200)));
    }

    function boxes() {
      let m = new Map();
      attars.forEach(function(el) { m.set(el, el.getBoundingClientRect()); });
      return m;
    }

    let lastOrder = "";

    function apply() {
      if(polyUser) polyUser.setAttribute("points", getPts(w, x, y, z));

      let distances: any[] = [];
      attars.forEach(function(el) {
        let d = getDistance(el);
        let s = getStrength(d);
        distances.push({ el: el, d: d, s: s });
        let pbar = el.querySelector(".match-bar") as HTMLElement;
        if(pbar) pbar.style.setProperty("--v", String(Math.round(s)));
      });

      distances.sort(function(a, b) { return a.d - b.d; });
      let newOrder = distances.map(function(o) { return o.el.id; }).join(",");

      if (newOrder !== lastOrder) {
        let first: any = null;
        if (!REDUCED && lastOrder) first = boxes();

        distances.forEach(function(o, i) {
          let el = o.el;
          el.classList.remove("is-rank-1", "is-rank-2", "is-rank-other");
          if (i === 0) el.classList.add("is-rank-1");
          else if (i === 1) el.classList.add("is-rank-2");
          else el.classList.add("is-rank-other");
          
          list?.appendChild(el);
        });

        if (first) {
          let last = boxes();
          attars.forEach(function(el) {
            let f = first.get(el);
            let l = last.get(el);
            let dy = f.top - l.top;
            if (dy !== 0) {
              el.animate([
                { transform: "translateY(" + dy + "px)" },
                { transform: "translateY(0)" }
              ], { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
            }
          });
        }
        lastOrder = newOrder;
      }
    }

    const sw = () => { w = parseFloat(sliders[0].value); apply(); };
    const sx = () => { x = parseFloat(sliders[1].value); apply(); };
    const sy = () => { y = parseFloat(sliders[2].value); apply(); };
    const sz = () => { z = parseFloat(sliders[3].value); apply(); };

    sliders[0].addEventListener("input", sw);
    sliders[1].addEventListener("input", sx);
    sliders[2].addEventListener("input", sy);
    sliders[3].addEventListener("input", sz);

    apply();

    // Voice phrasing
    let WORDS = ["far toward", "toward", "leaning", "balanced", "leaning", "toward", "far toward"];
    function phrase(el: HTMLInputElement) {
      let v = Number(el.value),
          low = el.getAttribute('data-pole-low'), high = el.getAttribute('data-pole-high'),
          band = Math.min(6, Math.floor(v / (100 / 7))),
          word = WORDS[band];
      if (band === 3) return "balanced between " + low + " and " + high;
      return word + " " + (band < 3 ? low : high);
    }
    const syncFuncs: any[] = [];
    Array.prototype.forEach.call(sliders, function (el) {
      const sync = () => { el.setAttribute("aria-valuetext", phrase(el)); };
      el.addEventListener("input", sync);
      sync();
      syncFuncs.push({el, sync});
    });

    return () => {
        sliders[0].removeEventListener("input", sw);
        sliders[1].removeEventListener("input", sx);
        sliders[2].removeEventListener("input", sy);
        sliders[3].removeEventListener("input", sz);
        syncFuncs.forEach((sf) => sf.el.removeEventListener("input", sf.sync));
    };
  }, []);

  return (
    <main id="content" data-od-id="page-finder">
      <section className="section section--tight wrap" data-od-id="finder-head">
        <div className="head">
          <p className="eyebrow" data-motion="mask">Finder</p>
          <div className="head__row">
            <h1 data-motion="mask">Calibrate the instrument.</h1>
            <p className="lead head__note">Map a scent by four axes. The archive reorders to match the profile you draw in real time.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>
      </section>

      <section className="section wrap" data-od-id="finder-body">
        <div className="finder">
          <form className="finder__calib" data-od-id="finder-calibrator" onSubmit={(e)=>e.preventDefault()}>
            <div className="radar">
              <svg viewBox="-150 -150 300 300" aria-hidden="true" focusable="false">
                <circle cx="0" cy="0" r="100" className="radar__grid"/>
                <circle cx="0" cy="0" r="75" className="radar__grid"/>
                <circle cx="0" cy="0" r="50" className="radar__grid"/>
                <circle cx="0" cy="0" r="25" className="radar__grid"/>
                
                <line x1="0" y1="-100" x2="0" y2="100" className="radar__axis" />
                <line x1="-100" y1="0" x2="100" y2="0" className="radar__axis" />
                <line x1="-70.7" y1="-70.7" x2="70.7" y2="70.7" className="radar__axis" />
                <line x1="-70.7" y1="70.7" x2="70.7" y2="-70.7" className="radar__axis" />

                <text x="0" y="-115" className="radar__label" textAnchor="middle">Warm</text>
                <text x="82" y="-82" className="radar__label" textAnchor="start">Heavy</text>
                <text x="115" y="4" className="radar__label" textAnchor="start">Smoky</text>
                <text x="82" y="90" className="radar__label" textAnchor="start">Projecting</text>
                <text x="0" y="125" className="radar__label" textAnchor="middle">Fresh</text>
                <text x="-82" y="90" className="radar__label" textAnchor="end">Light</text>
                <text x="-115" y="4" className="radar__label" textAnchor="end">Sweet</text>
                <text x="-82" y="-82" className="radar__label" textAnchor="end">Intimate</text>

                <polygon id="poly-user" points="" />
              </svg>
            </div>

            <div className="calib__sliders">
              <div className="calib__group">
                <div className="calib__axis-read"><span>Fresh</span><span>Warm</span></div>
                <input className="range calib-range" type="range" min="0" max="100" defaultValue="50" aria-label="Fresh to Warm" id="ax-fresh-warm" data-pole-low="Fresh" data-pole-high="Warm" />
              </div>
              <div className="calib__group">
                <div className="calib__axis-read"><span>Light</span><span>Heavy</span></div>
                <input className="range calib-range" type="range" min="0" max="100" defaultValue="50" aria-label="Light to Heavy" id="ax-light-heavy" data-pole-low="Light" data-pole-high="Heavy" />
              </div>
              <div className="calib__group">
                <div className="calib__axis-read"><span>Sweet</span><span>Smoky</span></div>
                <input className="range calib-range" type="range" min="0" max="100" defaultValue="50" aria-label="Sweet to Smoky" id="ax-sweet-smoky" data-pole-low="Sweet" data-pole-high="Smoky" />
              </div>
              <div className="calib__group">
                <div className="calib__axis-read"><span>Intimate</span><span>Projecting</span></div>
                <input className="range calib-range" type="range" min="0" max="100" defaultValue="50" aria-label="Intimate to Projecting" id="ax-intimate-projecting" data-pole-low="Intimate" data-pole-high="Projecting" />
              </div>
            </div>
          </form>

          <ul className="finder__results" id="results-list" aria-live="polite">
            {products.map((p) => {
              const coords = defaultCoordinates[p.slug] || [50, 50, 50, 50];
              const w = coords[0];
              const x = coords[1];
              const y = coords[2];
              const z = coords[3];

              const hasImage = p.images && p.images.length > 0;
              const imageUrl = hasImage ? p.images[0].blob_url : null;
              
              return (
                <li className="match" id={`attar-${p.slug}`} data-attar="true" data-w={w} data-x={x} data-y={y} data-z={z} key={p.id}>
                  <div className="match__head">
                    <span className="eyebrow match__rank-label"></span>
                    <h2 className="six__name">{p.name}</h2>
                  </div>
                  <div className="match__expand">
                    {imageUrl ? (
                      <div className="match__vial" style={{ position: 'relative', width: '28px', height: '52px', mixBlendMode: 'multiply' }}>
                         <Image src={imageUrl} alt={p.name} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_URL} />
                      </div>
                    ) : (
                      <div className="vial vial--sm match__vial" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></div>
                    )}
                    <div className="match__data">
                      <div className="six__spec">
                        <span>Family · <b>{p.family || 'Woody'}</b></span>
                        <span>Origin · <b>{p.origin || 'Sylhet, Bangladesh'}</b></span>
                      </div>
                      <div className="six__foot">
                        <span className="label">3 ml vial</span>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                          <span className="six__price">৳ {Number(p.price).toLocaleString()}</span>
                          <Link className="link-under" href={`/product/${p.slug}`}>View Dossier</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="match__perf">
                    <div className="perf__label eyebrow">Match</div>
                    <div className="perf__scale">
                      <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar match-bar" style={{ '--v': 0 } as any}></span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
