"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./page.css";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default function ProductClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  useEffect(() => {
    // The exact vanilla TS for logic
    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- Batch 041, as drawn --------------------------------------------- */
    const SIZES = {
      "3":  { price: Number(product.price),  drops: 60,  drawn: 60, left: 41, status: "in" },
      "6":  { price: Number(product.price) * 1.8, drops: 120, drawn: 24, left: 11, status: "low" },
      "12": { price: Number(product.price) * 3.3, drops: 240, drawn: 0,  left: 0,  status: "unavailable" }
    } as any;
    const ORDER = ["3", "6", "12"];
    const state = { size: "3", soldOut: false };

    const seg       = document.querySelectorAll(".seg__opt");
    const priceEl   = document.querySelector("[data-price]");
    const perEl     = document.querySelector("[data-per]");
    const stockEl   = document.querySelector("[data-stock]");
    const stockTxt  = document.querySelector("[data-stock-text]");
    const stageSize = document.querySelector("[data-stage-size]");
    const batchBar  = document.querySelector("[data-batch-bar]");
    const batchLeft = document.querySelector("[data-batch-left]");
    const batchDraw = document.querySelector("[data-batch-drawn]");
    const vialFig   = document.querySelector("[data-vial-figure]");
    const bar       = document.querySelector("[data-bar]");
    const barBuy    = document.querySelector("[data-bar-buy]");
    const barNotify = document.querySelector("[data-bar-notify]");
    const barPrice  = document.querySelector("[data-bar-price]");
    const barNote   = document.querySelector("[data-bar-note]");
    const barMeta   = document.querySelector("[data-bar-meta]");
    const addBtn    = document.querySelector("[data-add]") as HTMLButtonElement;
    const stateBtns = document.querySelectorAll("[data-state]");

    function taka(n: number) { return product.currency + " " + n.toLocaleString("en-US"); }

    function statusOf(size: string) {
      if (state.soldOut) return "sold";
      return SIZES[size].status;
    }

    function paint() {
      let size = state.size, d = SIZES[size], st = statusOf(size);
      
      Array.prototype.forEach.call(seg, function (btn) {
        let s = btn.getAttribute("data-size"), ds = SIZES[s], bs = statusOf(s);
        btn.setAttribute("aria-checked", String(s === size));
        btn.disabled = bs === "unavailable" || bs === "sold";
        const note = btn.querySelector("[data-seg-note]");
        if(note) note.textContent =
          bs === "unavailable" ? "Not drawn" :
          bs === "sold"        ? "Sold out"  :
          bs === "low"         ? ds.left + " left" :
                                 ds.drawn + " drawn";
      });

      if(priceEl) priceEl.textContent = taka(d.price);
      if(perEl) perEl.textContent   = taka(Math.round(d.price / parseInt(size, 10))) + " per ml";

      if(stockEl) stockEl.setAttribute("data-status", st);
      if(stockTxt) stockTxt.innerHTML =
        st === "in"          ? `Batch ${product.sku || '041'} open · <b class="num">` + d.left + `</b> of <b class="num">` + d.drawn + `</b> vials remain` :
        st === "low"         ? `Low batch · <b class="num">` + d.left + `</b> vials of <b class="num">` + d.drawn + `</b> remain at this size` :
        st === "sold"        ? `Sold out · batch ${product.sku || '041'} closed at <b class="num">60</b> vials` :
                               `<b class="num">` + size + ` ml</b> was not drawn for batch ${product.sku || '041'} · 3 ml and 6 ml are open`;

      if(stageSize) stageSize.textContent = size + " ml · " + d.drops + " drops";
      if(batchDraw) batchDraw.textContent = st === "unavailable" ? "0" : String(d.drawn);
      if(batchLeft) batchLeft.textContent = st === "sold" ? "0 remain" :
                              st === "unavailable" ? "not drawn" : d.left + " remain";
      let pct = st === "sold" || st === "unavailable" || !d.drawn ? 0 : Math.round((d.left / d.drawn) * 100);
      
      if(batchBar){
        (batchBar as HTMLElement).style.setProperty("--v", String(pct));
        let par = batchBar.parentNode as HTMLElement;
        if(par) par.setAttribute("aria-label",
          st === "unavailable" ? `12 ml was not drawn for batch ${product.sku || '041'}`
                               : d.left + " of " + d.drawn + ` vials remain in batch ${product.sku || '041'}`);
      }
      
      if(vialFig) vialFig.setAttribute("aria-label", `A ${size} millilitre ${product.name} vial.`);

      if(barMeta) barMeta.textContent = `Batch ${product.sku || '041'} · ${size} ml · 24%`;
      if(barBuy) (barBuy as any).hidden    = st === "sold";
      if(barNotify) (barNotify as any).hidden = st !== "sold";
      
      if (st !== "sold") {
        if(barPrice) barPrice.textContent = taka(d.price);
        if(addBtn){
          addBtn.disabled = st === "unavailable";
          addBtn.textContent = st === "unavailable" ? `Not drawn for ${product.sku || '041'}` : "Add the vial";
        }
        if(barNote) barNote.textContent =
          st === "low"         ? "Low batch · " + d.left + " vials left" :
          st === "unavailable" ? "Choose 3 ml or 6 ml" :
                                 d.left + " of " + d.drawn + " vials remain";
      }
    }

    const clickSeg = (e: any) => {
        let btn = e.currentTarget;
        if (btn.disabled) return;
        state.size = btn.getAttribute("data-size");
        paint();
    };
    const keySeg = (e: any) => {
        let btn = e.currentTarget;
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        let i = ORDER.indexOf(btn.getAttribute("data-size"));
        let next = ORDER[(i + (e.key === "ArrowRight" ? 1 : ORDER.length - 1)) % ORDER.length];
        let el = document.querySelector('.seg__opt[data-size="' + next + '"]') as any;
        if(el){
            el.focus();
            if (!el.disabled) { state.size = next; paint(); }
        }
    };

    Array.prototype.forEach.call(seg, function (btn) {
      btn.addEventListener("click", clickSeg);
      btn.addEventListener("keydown", keySeg);
    });

    const clickStateBtn = (e: any) => {
        let b = e.currentTarget;
        let name = b.getAttribute("data-state");
        state.soldOut = name === "sold";
        if (name === "in") state.size = "3";
        if (name === "low") state.size = "6";
        if (name === "unavailable") { state.size = "12"; }
        if (name === "sold") state.size = "3";
        Array.prototype.forEach.call(stateBtns, function (bx) {
          bx.setAttribute("aria-pressed", String(bx.getAttribute("data-state") === name));
        });
        paint();
    };

    Array.prototype.forEach.call(stateBtns, function (b) {
      b.addEventListener("click", clickStateBtn);
    });

    const clickAcc = (e: any) => {
        let head = e.currentTarget;
        let item = head.parentNode;
        let open = item.getAttribute("data-open") === "true";
        item.setAttribute("data-open", String(!open));
        head.setAttribute("aria-expanded", String(!open));
    };

    Array.prototype.forEach.call(document.querySelectorAll("[data-acc]"), function (head) {
      head.addEventListener("click", clickAcc);
    });

    let tiers = document.querySelectorAll("[data-tier]");
    let tierObs: any;
    if (REDUCED || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(tiers, function (t) { t.classList.add("is-resolved"); });
    } else {
      tierObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-resolved");
          tierObs.unobserve(e.target);
        });
      }, { threshold: 0.55 });
      Array.prototype.forEach.call(tiers, function (t) { tierObs.observe(t); });
    }

    let pyramid = document.querySelector('[data-od-id="product-pyramid"]');
    if(bar) (bar as any).hidden = false;
    function readBar() {
      if(!pyramid || !bar) return;
      let past = pyramid.getBoundingClientRect().bottom < 0;
      bar.classList.toggle("is-in", past);
    }
    window.addEventListener("scroll", readBar, { passive: true });
    window.addEventListener("resize", readBar);
    readBar();

    let countEl = document.querySelector("[data-cart-count]");
    let count = parseInt(window.localStorage.getItem("nadd-vials") || "0", 10) || 0;
    function paintCount() { if(countEl) countEl.textContent = count < 10 ? "0" + count : String(count); }
    paintCount();

    const clickAdd = () => {
      if (!addBtn || addBtn.disabled) return;
      count += 1;
      window.localStorage.setItem("nadd-vials", String(count));
      paintCount();
      let d = SIZES[state.size];
      if (d.left > 0) { d.left -= 1; }
      addBtn.textContent = "Logged · " + state.size + " ml";
      window.setTimeout(function () { paint(); }, 1400);
    };
    if(addBtn) addBtn.addEventListener("click", clickAdd);

    const submitNotify = (e: any) => {
        e.preventDefault();
        let input = document.getElementById("notify-mail") as HTMLInputElement;
        if (!input.value || input.value.indexOf("@") === -1) { input.focus(); return; }
        const ack = document.querySelector("[data-notify-ack]");
        if(ack) (ack as any).hidden = false;
        input.value = "";
        input.disabled = true;
    };
    if(barNotify) barNotify.addEventListener("submit", submitNotify);

    paint();

    return () => {
        Array.prototype.forEach.call(seg, function (btn) {
          btn.removeEventListener("click", clickSeg);
          btn.removeEventListener("keydown", keySeg);
        });
        Array.prototype.forEach.call(stateBtns, function (b) {
          b.removeEventListener("click", clickStateBtn);
        });
        Array.prototype.forEach.call(document.querySelectorAll("[data-acc]"), function (head) {
          head.removeEventListener("click", clickAcc);
        });
        if(tierObs){
            Array.prototype.forEach.call(tiers, function (t) { tierObs.unobserve(t); });
        }
        window.removeEventListener("scroll", readBar);
        window.removeEventListener("resize", readBar);
        if(addBtn) addBtn.removeEventListener("click", clickAdd);
        if(barNotify) barNotify.removeEventListener("submit", submitNotify);
    };
  }, [product]);

  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0].blob_url : null;
  const altText = hasImage ? (product.images[0].alt_text || product.name) : product.name;

  return (
    <>
      <main id="content" data-od-id="page-product">
        <section className="section section--tight wrap" data-od-id="product-malik-oud">
          <div className="pd">
            {/* ---------- Left: sticky vial stage ---------- */}
            <aside className="pd__stage" data-od-id="product-stage">
              <div className="pd__vial-wrap">
                <svg className="pd__rings" viewBox="0 0 440 440" aria-hidden="true" focusable="false">
                  <circle cx="220" cy="220" r="70"></circle>
                  <circle cx="220" cy="220" r="124"></circle>
                  <circle cx="220" cy="220" r="178"></circle>
                </svg>
                <div className="pd__vial" data-vial>
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '90px', height: '220px', mixBlendMode: 'multiply' }}>
                      <Image src={imageUrl} alt={altText} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_URL} />
                    </div>
                  ) : (
                    <div className="vial vial--lg" role="img" aria-label={`A 3 millilitre ${product.name} vial.`} data-vial-figure>
                      <span className="vial__cap"></span>
                      <span className="vial__neck"></span>
                      <span className="vial__body"></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pd__fill">
                <p className="label">Batch draw · <span className="num" data-batch-drawn>60</span> vials</p>
                <div className="pd__fill-bar" role="img" aria-label="41 of 60 vials remain in batch">
                  <span style={{ '--v': 68 } as any} data-batch-bar></span>
                </div>
                <div className="pd__fill-scale"><span data-batch-left>41 remain</span><span data-batch-code>Batch {product.sku || '041'} · drawn 21.01</span></div>
              </div>

              <div className="pd__caption">
                <span className="eyebrow">{product.name} · 3 ml</span>
                <span className="eyebrow num" data-stage-size>3 ml · 60 drops</span>
              </div>
            </aside>

            {/* ---------- Right: the dossier ---------- */}
            <div className="pd__col">
              <div className="pd__block" data-od-id="product-identity">
                <p className="eyebrow" data-motion="mask">Archive {product.sku || '041'} · {product.origin || 'Sylhet'}</p>
                <h1 className="pd__name" data-motion="mask">{product.name}</h1>
                <p className="pd__family">{product.family || 'Woody'} · {product.description || 'Aged Aquilaria malaccensis, cut at 24% into Mysore sandalwood.'}</p>

                <div className="pd__price-row">
                  <span className="pd__price num" data-price>৳ {Number(product.price).toLocaleString()}</span>
                  <span className="pd__per num" data-per>৳ {Math.round(Number(product.price)/ (Number(product.size) || 3)).toLocaleString()} per ml</span>
                </div>

                <div className="seg" role="radiogroup" aria-label="Vial size" data-od-id="size-selector">
                  <button className="seg__opt" type="button" role="radio" aria-checked="true" data-size="3">
                    <span className="seg__size">3 ml</span>
                    <span className="seg__cost num">৳ {Number(product.price).toLocaleString()}</span>
                    <span className="seg__note" data-seg-note>60 drawn</span>
                  </button>
                  <button className="seg__opt" type="button" role="radio" aria-checked="false" data-size="6">
                    <span className="seg__size">6 ml</span>
                    <span className="seg__cost num">৳ {(Number(product.price)*1.8).toLocaleString()}</span>
                    <span className="seg__note" data-seg-note>24 drawn</span>
                  </button>
                  <button className="seg__opt" type="button" role="radio" aria-checked="false" data-size="12">
                    <span className="seg__size">12 ml</span>
                    <span className="seg__cost num">৳ {(Number(product.price)*3.3).toLocaleString()}</span>
                    <span className="seg__note" data-seg-note>Not drawn</span>
                  </button>
                </div>

                <p className="stock" data-stock data-status="in" aria-live="polite">
                  <i aria-hidden="true"></i>
                  <span data-stock-text>Batch {product.sku || '041'} open · <b className="num">41</b> of <b className="num">60</b> vials remain</span>
                </p>
              </div>

              {/* 2. OLFACTIVE PYRAMID (simplified static demo) */}
              <div className="pd__block" data-od-id="product-pyramid">
                <div className="pd__legend">
                  <h2 data-motion="mask">Read from the top down.</h2>
                  <p className="lead head__note">Oil does not open the way alcohol does. Each tier arrives at skin temperature, in its own time.</p>
                </div>

                <div className="pyr" data-od-id="pyramid-tiers">
                  <div className="pyr__tier" data-tier>
                    <h3>Top</h3>
                    <p className="pyr__notes">Saffron thread, pink pepper, a dry citrus edge.</p>
                    <p className="pyr__time num">0 — 25 min<br/>Above the skin</p>
                    <i className="pyr__hair" aria-hidden="true"></i>
                  </div>
                  <div className="pyr__tier" data-tier>
                    <h3>Heart</h3>
                    <p className="pyr__notes">Taif rose absolute, damp cedar.</p>
                    <p className="pyr__time num">25 min — 3 h<br/>On the skin</p>
                    <i className="pyr__hair" aria-hidden="true"></i>
                  </div>
                  <div className="pyr__tier" data-tier>
                    <h3>Base</h3>
                    <p className="pyr__notes">Aged Sylheti oud, Mysore sandalwood, leather.</p>
                    <p className="pyr__time num">3 h — 9.5 h<br/>In the skin</p>
                    <i className="pyr__hair" aria-hidden="true"></i>
                  </div>
                </div>
              </div>

              {/* 3. DOSSIER TABLE */}
              <div className="pd__block" data-od-id="product-dossier">
                <div className="pd__legend">
                  <h2 data-motion="mask">The dossier.</h2>
                  <p className="lead head__note">Logged against the material lot at the draw. Nothing is blended from an unnamed source.</p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="dossier" data-od-id="dossier-table" style={{ width: '100%' }}>
                    <caption>{product.name} · batch {product.sku || '041'} · lot L-2024-11</caption>
                    <tbody>
                      <tr>
                        <th scope="row">Origin</th>
                        <td>{product.origin || 'Aquilaria malaccensis · Sylhet, Bangladesh'}
                          <small>Fallen heartwood, 18 years infected, harvested 09.2023</small></td>
                      </tr>
                      <tr>
                        <th scope="row">Concentration</th>
                        <td><span className="num">{product.concentration || '24%'}</span> in Mysore sandalwood carrier
                          <small>Santalum album, lot L-2023-08 · no ethanol, no fixative</small></td>
                      </tr>
                      <tr>
                        <th scope="row">Batch</th>
                        <td><span className="num">{product.sku || '041'}</span> · drawn <span className="num">21.01</span> · <span className="num">60</span> vials
                          <small>Decanted through cotton, held two days, logged vial by vial</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. PERFORMANCE */}
              <div className="pd__block" data-od-id="product-performance">
                <div className="pd__legend">
                  <h2 data-motion="mask">Sillage and longevity, in units.</h2>
                  <p className="lead head__note">Two drops on the inner wrist at 22°C and 55% RH, read by three panelists at fixed intervals. Median reported.</p>
                </div>

                <div className="perf" data-od-id="performance-bars">
                  <div className="perf__row">
                    <div className="perf__label"><strong>Sillage</strong><span>Projection radius</span></div>
                    <div className="perf__scale">
                      <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar" style={{ '--v': 56 } as any} role="img" aria-label="Sillage 34 centimetres of a 60 centimetre scale"></span>
                    </div>
                    <p className="perf__val">34 cm<small>at 60 min</small></p>
                  </div>

                  <div className="perf__row">
                    <div className="perf__label"><strong>Longevity</strong><span>Detectable on skin</span></div>
                    <div className="perf__scale">
                      <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar" style={{ '--v': 79 } as any} role="img" aria-label="Longevity 9.5 hours of a 12 hour scale"></span>
                    </div>
                    <p className="perf__val">{product.longevity || '9.5'} h<small>median of 3</small></p>
                  </div>

                  <div className="perf__row">
                    <div></div>
                    <div className="perf__axis"><span>0</span><span>15 cm / 3 h</span><span>30 cm / 6 h</span><span>45 cm / 9 h</span><span>60 cm / 12 h</span></div>
                    <div></div>
                  </div>
                </div>
              </div>

              {/* 5. APPLICATION */}
              <div className="pd__block" data-od-id="product-application">
                <div className="pd__legend">
                  <h2 data-motion="mask">How this one is worn.</h2>
                  <p className="lead head__note">At {product.concentration || '24%'} the dose is smaller than it looks. Attar is placed, not sprayed.</p>
                </div>

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
                <div className="pd__legend">
                  <h2 data-motion="mask">Terms of the vial.</h2>
                </div>

                <div className="acc" data-od-id="terms-accordion">
                  <div className="acc__item" data-open="true">
                    <button className="acc__head" type="button" aria-expanded="true" aria-controls="acc-ship" data-acc>
                      Shipping <span>01</span>
                    </button>
                    <div className="acc__panel" id="acc-ship" role="region"><div>
                      <p>Dhaka, next day by courier. Elsewhere in Bangladesh, two to three days. International orders leave Dhaka within 48 hours and clear in five to twelve days depending on customs.</p>
                    </div></div>
                  </div>
                  <div className="acc__item" data-open="false">
                    <button className="acc__head" type="button" aria-expanded="false" aria-controls="acc-ret" data-acc>
                      Returns <span>02</span>
                    </button>
                    <div className="acc__panel" id="acc-ret" role="region"><div>
                      <p>An unopened vial returns within 14 days for a full refund, seal intact. Once the cap is broken the vial cannot be resold and is not returnable.</p>
                    </div></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ CROSS-SELL ============ */}
        <section className="section section--tight wrap" data-od-id="product-adjacent">
          <div className="head">
            <p className="eyebrow" data-motion="mask">Adjacent in the archive</p>
            <div className="head__row">
              <h2 data-motion="mask">Two that sit beside it.</h2>
              <p className="lead head__note">Selections from our current offerings.</p>
            </div>
            <hr className="rule hairline-draw" data-motion="hairline" />
          </div>

          <div className="grid-hair" data-od-id="adjacent-grid">
            {relatedProducts.slice(0, 2).map((p, idx) => {
              const pImageUrl = p.images && p.images.length > 0 ? p.images[0].blob_url : null;
              
              return (
                <a key={p.id} className="six__card col-3" href={`/product/${p.slug}`}>
                  <span className="six__index num">0{idx + (product.sku?Number(product.sku):1)} · Batch {p.sku || '041'}</span>
                  <div>
                    {pImageUrl ? (
                      <div style={{ position: 'relative', width: '28px', height: '52px', mixBlendMode: 'multiply' }} aria-hidden="true">
                        <Image src={pImageUrl} alt={p.name} fill style={{ objectFit: 'contain' }} placeholder="blur" blurDataURL={BLUR_URL} />
                      </div>
                    ) : (
                      <span className="vial vial--sm" aria-hidden="true"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
                    )}
                    <h3 className="six__name">{p.name}</h3>
                    <div className="six__spec">
                      <span>Family · <b>{p.family || 'Woody'}</b></span>
                      <span>Concentration · <b>{p.concentration || '24%'}</b></span>
                    </div>
                  </div>
                  <div className="six__foot">
                    <span className="label">3 ml vial</span>
                    <span className="six__price">{p.currency} {p.price.toString()}</span>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      </main>

      {/* ============ STICKY BAR ============ */}
      <div className="bar" data-od-id="sticky-bar" data-bar hidden>
        <div className="wrap bar__inner">
          <div className="bar__id">
            <strong>{product.name}</strong>
            <span data-bar-meta>Batch {product.sku || '041'} · 3 ml · 24%</span>
          </div>

          <div className="bar__right" data-bar-buy>
            <span className="bar__price num" data-bar-price>৳ {Number(product.price).toLocaleString()}</span>
            <span className="field__hint" data-bar-note>41 of 60 vials remain</span>
            <button className="btn-gold" type="button" data-add>Add the vial</button>
          </div>

          <form className="bar__right notify" data-bar-notify hidden onSubmit={(e)=>e.preventDefault()}>
            <div className="field">
              <label className="field__hint" htmlFor="notify-mail">Batch {product.sku || '041'} is closed · tell me when next is drawn</label>
              <input className="field__input" id="notify-mail" type="email" autoComplete="email" placeholder="name@example.com" required />
            </div>
            <button className="btn-gold" type="submit" data-notify>Log the request</button>
            <span className="bar__ack" data-notify-ack hidden>Logged · you will hear at the draw</span>
          </form>
        </div>
      </div>
    </>
  );
}
