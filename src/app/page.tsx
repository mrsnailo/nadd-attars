import './page.css';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getProducts } from "@/lib/db";
import Image from "next/image";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default async function HomePage() {
  const products = await getProducts();
  const indexProducts = products.length ? products.slice(0, 6) : [];

  return (
    <main id="content">

      {/* ============ 1. HERO ============ */}
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
              <circle cx="280" cy="280" r="80"></circle>
              <circle cx="280" cy="280" r="144"></circle>
              <circle cx="280" cy="280" r="208"></circle>
              <circle cx="280" cy="280" r="272"></circle>
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

      {/* ============ 2. THE SIX ============ */}
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
            const spanClass = (i === 0) ? "col-3" : (i === 2 ? "col-2" : "col-2");
            // the prototype grid has a specific asymmetric layout. I'll just map them.
            
            return (
              <Link key={p.id} className={`six__card ${spanClass}`} href={`/product/${p.slug}`}>
                <span className="six__index num">{String(i + 1).padStart(2, '0')} · Batch {p.sku || '041'}</span>
                <div>
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '28px', height: '52px', mixBlendMode: 'multiply' }} aria-hidden="true">
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
                    <span>Family · <b>{p.family || 'Woody'}</b></span>
                    <span>Concentration · <b>{p.concentration || '20%'}</b></span>
                  </div>
                </div>
                <div className="six__foot">
                  <span className="label">{p.size} vial</span>
                  <span className="six__price">{p.currency} {p.price.toString()}</span>
                </div>
              </Link>
            )
          })}
          
          <div className="six__cell col-4" data-od-id="six-process-note">
            <p className="label">One process</p>
            <p className="lead">Distilled or expressed, cut into a single carrier oil, rested forty days in the dark. No ethanol, no fixative, no batch larger than sixty vials.</p>
          </div>
        </div>
      </section>

      {/* ============ 3. OLFACTIVE PYRAMID ============ */}
      <section className="section wrap" data-od-id="pyramid">
        <div className="head">
          <p className="eyebrow" data-motion="mask">Olfactive pyramid · Mālik Oud, batch 041</p>
          <div className="head__row">
            <h2 data-motion="mask">Read from the top down.</h2>
            <p className="lead head__note">Oil does not open the way alcohol does. Each tier arrives at skin temperature, in its own time.</p>
          </div>
        </div>

        <div className="pyr" data-od-id="pyramid-tiers">
          <div className="pyr__tier">
            <h3 data-motion="mask">Top</h3>
            <p className="pyr__notes" data-motion="mask">Saffron thread, pink pepper, a dry citrus edge off bergamot rind.</p>
            <p className="pyr__time num">0 — 25 min<br/>Above the skin</p>
          </div>
          <div className="pyr__tier">
            <h3 data-motion="mask">Heart</h3>
            <p className="pyr__notes" data-motion="mask">Taif rose absolute, damp cedar, a trace of the still&apos;s own smoke.</p>
            <p className="pyr__time num">25 min — 3 h<br/>On the skin</p>
          </div>
          <div className="pyr__tier">
            <h3 data-motion="mask">Base</h3>
            <p className="pyr__notes" data-motion="mask">Aged Sylheti oud, Mysore sandalwood, ambrette seed, worn leather.</p>
            <p className="pyr__time num">3 h — 9.5 h<br/>In the skin</p>
          </div>
        </div>
      </section>

      {/* ============ 4. MACERATION ============ */}
      <section className="on-dark" data-od-id="maceration">
        <div className="mac__track">
          <div className="mac__stage">
            <div className="wrap">
              <p className="eyebrow">Maceration · 40 days · 22°C · no light</p>
              <h2 className="mac__title">Forty days in the dark, before a single vial opens.</h2>

              <div className="mac__days" aria-hidden="true">
                <i className="tick"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                <i className="tick"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                <i className="tick"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                <i className="tick"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                <i className="tick"></i>
              </div>
              <div className="mac__bar"><span className="mac__fill"></span></div>
              <div className="mac__scale">
                <span>Day 01</span><span>Day 10</span><span>Day 20</span><span>Day 30</span><span>Day 40</span>
              </div>

              <div className="mac__phases">
                <div className="mac__phase">
                  <h3>Day <span className="num">01</span>—<span className="num">09</span> · Cut</h3>
                  <p>Oud oil is cut into sandalwood carrier at 24%, sealed in amber glass and set on the low shelf.</p>
                </div>
                <div className="mac__phase">
                  <h3>Day <span className="num">10</span>—<span className="num">19</span> · Bind</h3>
                  <p>The volatile top falls away. Rose and cedar bind to the carrier and stop moving against it.</p>
                </div>
                <div className="mac__phase">
                  <h3>Day <span className="num">20</span>—<span className="num">29</span> · Rest</h3>
                  <p>Turned once by hand, never shaken. Sharpness on the opening measurably falls.</p>
                </div>
                <div className="mac__phase">
                  <h3>Day <span className="num">30</span>—<span class="num">40</span> · Draw</h3>
                  <p>Decanted through cotton, held two days, then drawn into sixty 3 ml vials and logged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. PROVENANCE ============ */}
      <section className="section wrap" data-od-id="provenance">
        <div className="head">
          <p className="eyebrow" data-motion="mask">Provenance</p>
          <div className="head__row">
            <h2 data-motion="mask">Four materials, four sources.</h2>
            <p className="lead head__note">Every batch is logged against its material lot. Nothing is blended from an unnamed source.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="dossier" data-od-id="provenance-table" style={{ width: '100%' }}>
            <caption>Material register · lots in circulation, batch 036 — 044</caption>
            <thead>
              <tr>
                <th scope="col">Material</th>
                <th scope="col">Origin</th>
                <th scope="col">Extraction</th>
                <th scope="col">Lot</th>
                <th scope="col">Batch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Oud</th>
                <td>Aquilaria malaccensis · Sylhet, Bangladesh</td>
                <td>Hydro-distilled, 72 h, copper still</td>
                <td className="num">L-2024-11</td>
                <td className="num">041 · 044</td>
              </tr>
              <tr>
                <th scope="row">Rose</th>
                <td>Rosa damascena · Taif, Saudi Arabia</td>
                <td>Steam-distilled, first water</td>
                <td className="num">L-2025-03</td>
                <td className="num">038</td>
              </tr>
              <tr>
                <th scope="row">Sandalwood</th>
                <td>Santalum album · Mysore, India</td>
                <td>Steam-distilled, 96 h, heartwood only</td>
                <td className="num">L-2023-08</td>
                <td className="num">036 · 041</td>
              </tr>
              <tr>
                <th scope="row">Musk</th>
                <td>Abelmoschus moschatus, ambrette · Gujarat, India</td>
                <td>CO₂ extraction, seed</td>
                <td className="num">L-2025-01</td>
                <td className="num">044</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ 6. PERFORMANCE ============ */}
      <section className="section wrap" data-od-id="performance">
        <div className="head">
          <p className="eyebrow" data-motion="mask">Performance · 22°C, 55% RH, inner wrist</p>
          <div className="head__row">
            <h2 data-motion="mask">Sillage and longevity, in units.</h2>
            <p className="lead head__note">Two drops, read by three panelists at fixed intervals. Median reported, scale fixed at 60 cm and 12 hours.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>

        <div className="perf" data-od-id="performance-bars">
          <div className="perf__row">
            <div className="perf__label"><strong>Mālik Oud</strong><span>Sillage · projection radius</span></div>
            <div className="perf__scale">
              <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
              <span className="perf__bar" style={{ '--v': 56 } as React.CSSProperties} role="img" aria-label="Sillage 34 centimetres of a 60 centimetre scale"></span>
            </div>
            <p className="perf__val">34 cm<small>at 60 min</small></p>
          </div>

          <div className="perf__row">
            <div className="perf__label"><strong>Mālik Oud</strong><span>Longevity · detectable on skin</span></div>
            <div className="perf__scale">
              <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
              <span className="perf__bar" style={{ '--v': 79 } as React.CSSProperties} role="img" aria-label="Longevity 9.5 hours of a 12 hour scale"></span>
            </div>
            <p className="perf__val">9.5 h<small>median of 3</small></p>
          </div>

          <div className="perf__row">
            <div className="perf__label"><strong>Musk Abyaḍ</strong><span>Sillage · projection radius</span></div>
            <div className="perf__scale">
              <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
              <span className="perf__bar" style={{ '--v': 22 } as React.CSSProperties} role="img" aria-label="Sillage 13 centimetres of a 60 centimetre scale"></span>
            </div>
            <p className="perf__val">13 cm<small>at 60 min</small></p>
          </div>

          <div className="perf__row">
            <div className="perf__label"><strong>Musk Abyaḍ</strong><span>Longevity · detectable on skin</span></div>
            <div className="perf__scale">
              <i style={{ left: '0' }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
              <span className="perf__bar" style={{ '--v': 52 } as React.CSSProperties} role="img" aria-label="Longevity 6.2 hours of a 12 hour scale"></span>
            </div>
            <p className="perf__val">6.2 h<small>median of 3</small></p>
          </div>

          <div className="perf__row">
            <div></div>
            <div className="perf__axis"><span>0</span><span>15 cm / 3 h</span><span>30 cm / 6 h</span><span>45 cm / 9 h</span><span>60 cm / 12 h</span></div>
            <div></div>
          </div>
        </div>
      </section>

      {/* ============ 7. APPLICATION ============ */}
      <section className="section wrap" data-od-id="application">
        <div className="head">
          <p className="eyebrow" data-motion="mask">Application</p>
          <div className="head__row">
            <h2 data-motion="mask">Where oil is worn.</h2>
            <p className="lead head__note">Attar is placed, not sprayed. Warm points carry it; the cloth between them holds it into a second day.</p>
          </div>
          <hr className="rule hairline-draw" data-motion="hairline" />
        </div>

        <div className="apply" data-od-id="application-diagram">
          <svg className="apply__diagram" viewBox="0 0 420 400" role="img" aria-label="Line diagram of four pulse points with their doses: behind the ear, base of the throat, inner elbow, inner wrist.">
            <line x1="210" y1="16" x2="210" y2="384"></line>
            <line x1="40" y1="72" x2="380" y2="72"></line>
            <line x1="40" y1="160" x2="380" y2="160"></line>
            <line x1="40" y1="252" x2="380" y2="252"></line>
            <line x1="40" y1="340" x2="380" y2="340"></line>
            <circle cx="210" cy="72" r="4"></circle>
            <circle cx="210" cy="160" r="4"></circle>
            <circle cx="210" cy="252" r="4"></circle>
            <circle cx="210" cy="340" r="4"></circle>
            <text x="40" y="62">01 · BEHIND THE EAR</text>
            <text x="40" y="150">02 · BASE OF THE THROAT</text>
            <text x="40" y="242">03 · INNER ELBOW</text>
            <text x="40" y="330">04 · INNER WRIST</text>
            <text x="318" y="62">0.5 DROP</text>
            <text x="332" y="150">1 DROP</text>
            <text x="318" y="242">0.5 DROP</text>
            <text x="332" y="330">1 DROP</text>
          </svg>

          <div className="apply__list">
            <div className="apply__item">
              <span className="num">01</span>
              <div><h3>Behind the ear</h3><p>The warmest point on the body. Half a drop is the whole dose; more and the top burns off inside ten minutes.</p></div>
            </div>
            <div className="apply__item">
              <span className="num">02</span>
              <div><h3>Base of the throat</h3><p>Holds the heart tier longest. Place it before dressing, so the oil sets on skin and not on cloth.</p></div>
            </div>
            <div className="apply__item">
              <span className="num">03</span>
              <div><h3>Inner elbow</h3><p>Carries in movement. Use it when the wrist sits under a cuff or a watch strap.</p></div>
            </div>
            <div className="apply__item">
              <span className="num">04</span>
              <div><h3>Inner wrist</h3><p>Press the two wrists together. Never rub — friction shears the top notes off the carrier.</p></div>
            </div>
            <div className="apply__item">
              <span className="num">05</span>
              <div><h3>On cloth</h3><p>One drop on a scarf hem reads for two days. Oil marks light fabric; test an inside seam first.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. DISCOVERY SET ============ */}
      <section className="section section--tight wrap" data-od-id="discovery">
        <div className="panel disc">
          <div>
            <p className="eyebrow" data-motion="mask">Discovery set · 6 × 0.7 ml</p>
            <h2 data-motion="mask">All six, in sample.</h2>
            <p className="lead">Six vials drawn from the open batches with the dossier for each; the set price is credited against your first 3 ml order.</p>
            <Link className="btn-gold" href="/finder" data-od-id="discovery-cta">Take the set · ৳ 2,400</Link>
          </div>
          <div className="disc__vials" aria-hidden="true">
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
            <span className="vial vial--sm"><span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span></span>
          </div>
        </div>
      </section>

      {/* ============ 9. ARCHIVE MARQUEE ============ */}
      <div className="marq on-dark" data-od-id="archive-marquee" aria-label="Archive batch register">
        <div className="marq__row">
          <span><b>Batch 044</b> Musk Abyaḍ · 60 vials · drawn 12.03</span>
          <span><b>Batch 043</b> ʿAnbar · 60 vials · drawn 04.02</span>
          <span><b>Batch 041</b> Mālik Oud · 60 vials · drawn 21.01</span>
          <span><b>Batch 041</b> Zaʿfarān Oud · 48 vials · drawn 21.01</span>
          <span><b>Batch 038</b> Taif Rose · 60 vials · drawn 09.11</span>
          <span><b>Batch 036</b> Mysore Sandal · 42 vials · drawn 27.09</span>
          <span aria-hidden="true"><b>Batch 044</b> Musk Abyaḍ · 60 vials · drawn 12.03</span>
          <span aria-hidden="true"><b>Batch 043</b> ʿAnbar · 60 vials · drawn 04.02</span>
          <span aria-hidden="true"><b>Batch 041</b> Mālik Oud · 60 vials · drawn 21.01</span>
          <span aria-hidden="true"><b>Batch 041</b> Zaʿfarān Oud · 48 vials · drawn 21.01</span>
          <span aria-hidden="true"><b>Batch 038</b> Taif Rose · 60 vials · drawn 09.11</span>
          <span aria-hidden="true"><b>Batch 036</b> Mysore Sandal · 42 vials · drawn 27.09</span>
        </div>
      </div>
    </main>
  );
}
