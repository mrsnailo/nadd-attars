export const dynamic = 'force-dynamic';
import { getProductBySlug } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const imageUrl = product.images && product.images.length > 0 ? product.images[0].blob_url : undefined;
  const description = product.description || `An impeccable composition belonging to the ${product.family} family. Expertly balanced and aged.`;

  return {
    title: `${product.name} | NAḎḎ Attars`,
    description: description,
    openGraph: {
      title: product.name,
      description: description,
      url: `https://nadd-attars.vercel.app/product/${product.slug}`,
      siteName: 'NAḎḎ Attars',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0].blob_url : null;
  const altText = hasImage ? (product.images[0].alt_text || product.name) : product.name;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageUrl ? [imageUrl] : [],
    description: product.description || `An impeccable composition belonging to the ${product.family} family.`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.stock_count > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://nadd-attars.vercel.app/product/${product.slug}`
    }
  };

  return (
<main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="wrap border-box">
        <div className="breadcrumb reveal">
          <Link href="/">Home</Link> / <Link href="/collection">Collection</Link> / <span>{product.family}</span> / {product.name}
        </div>
      </div>

      <div className="product-layout">
        <div className="product-visual-col">
          <div className="product-visual-sticky">
            <div className="pv-glow"></div>
            {imageUrl ? (
              <div style={{ position: 'relative', width: '220px', height: '400px', zIndex: 10 }}>
                <Image 
                  src={imageUrl} 
                  alt={altText} 
                  fill
                  style={{ objectFit: 'contain' }}
                  placeholder="blur"
                  blurDataURL={BLUR_URL}
                  priority
                />
              </div>
            ) : (
              <div className="pv-bottle"></div>
            )}
            <div className="pv-label">No. {product.id.slice(-6)}</div>
          </div>
        </div>

        <div className="product-info-col">
          <div className="product-block">
            <h1 className="pi-title">{product.name}</h1>
            <p className="pi-desc">{product.description || `An impeccable composition belonging to the ${product.family} family. Expertly balanced and aged.`}</p>
            
            <div className="pi-price-row">
              <span className="pi-price">{product.currency} {product.price}</span>
              <span className="pi-size">{product.size}</span>
            </div>

            <div className="pi-cta">
              {product.stock_count > 0 ? (
                <button className="btn-gold">Add to Bag <span>+</span></button>
              ) : (
                <button className="btn-line" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Out of Stock</button>
              )}
            </div>
            {product.stock_count === 0 && (
                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted-on-linen)' }}>This item is currently unavailable. Check back for restocks.</p>
            )}
          </div>

          <div className="product-block">
            <h2 className="eyebrow" style={{ marginBottom: '32px' }}>Olfactive Pyramid</h2>
            
            {product.notes && product.notes.length > 0 ? (
              product.notes.map((note) => (
                <div key={note.id} className="pyr-tier is-active">
                  <div className="pyr-time">{note.time}</div>
                  <div className="pyr-tag">{note.tag}</div>
                  <div className="pyr-notes serif">{note.notes}</div>
                  {note.description && <div className="pyr-desc">{note.description}</div>}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--muted-on-linen)' }}>Olfactive notes are being updated.</p>
            )}
          </div>

          {product.metrics && (
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
          )}

        </div>
      </div>
    
</main>
  );
}
