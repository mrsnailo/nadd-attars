import { getProductBySlug } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="wrap border-box">
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link> / <Link href="/collection">Collection</Link> / <span>{product.family}</span> / {product.name}
        </div>
      </div>

      <div className="product-layout">
        <div className="product-visual-col">
          <div className="product-visual-sticky">
            <div className="pv-glow"></div>
            <div className="pv-bottle"></div>
            <div className="pv-label">No. {product.id}</div>
          </div>
        </div>

        <div className="product-info-col">
          <div className="product-block">
            <h1 className="pi-title">{product.name}</h1>
            <p className="pi-desc">An impeccable composition belonging to the {product.family} family. Expertly balanced and aged.</p>
            
            <div className="pi-price-row">
              <span className="pi-price">{product.currency} {product.price}</span>
              <span className="pi-size">{product.size}</span>
            </div>

            <div className="pi-cta">
              {product.stock_count > 0 ? (
                <button className="btn-gold">Add to Bag <span>+</span></button>
              ) : (
                <button className="btn-line" disabled style={{ opacity: 0.5 }}>Out of Stock</button>
              )}
            </div>
            {product.stock_count === 0 && (
                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted-on-linen)' }}>This item is currently unavailable. Check back for restocks.</p>
            )}
          </div>

          <div className="product-block">
            <h2 className="eyebrow" style={{ marginBottom: '32px' }}>Olfactive Pyramid</h2>
            
            <div className="pyr-tier is-active">
              <div className="pyr-time">0-2 hr</div>
              <div className="pyr-tag">Top Notes</div>
              <div className="pyr-notes serif">{product.notes.top_notes}</div>
            </div>
            <div className="pyr-tier is-active">
              <div className="pyr-time">2-6 hr</div>
              <div className="pyr-tag">Heart Notes</div>
              <div className="pyr-notes serif">{product.notes.heart_notes}</div>
            </div>
            <div className="pyr-tier is-active">
              <div className="pyr-time">6-12 hr</div>
              <div className="pyr-tag">Base Notes</div>
              <div className="pyr-notes serif">{product.notes.base_notes}</div>
            </div>
          </div>

          <div className="product-block">
            <h2 className="eyebrow" style={{ marginBottom: '32px' }}>Performance Metrics</h2>
            <div className="pmetrics metrics-trigger filled" style={{ '--w': '100%' } as React.CSSProperties}>
              <div className="pmetric-row">
                <div className="pmetric-label">Longevity</div>
                <div className="pmetric-bar"><i style={{ width: `${product.metrics.longevity}%` }}></i></div>
                <div className="pmetric-val">{product.metrics.longevity}%</div>
              </div>
              <div className="pmetric-row">
                <div className="pmetric-label">Sillage</div>
                <div className="pmetric-bar"><i style={{ width: `${product.metrics.sillage}%` }}></i></div>
                <div className="pmetric-val">{product.metrics.sillage}%</div>
              </div>
              <div className="pmetric-row">
                <div className="pmetric-label">Intensity</div>
                <div className="pmetric-bar"><i style={{ width: `${product.metrics.intensity}%` }}></i></div>
                <div className="pmetric-val">{product.metrics.intensity}%</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
