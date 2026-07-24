export const dynamic = 'force-dynamic';
import { getProducts } from "@/lib/db";
import Link from "next/link";

import Image from "next/image";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default async function CollectionPage() {
  const products = await getProducts();

  return (
    <div className="wrap border-box" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="breadcrumb reveal"><Link href="/">Home</Link> / Collection</div>
      
      <section className="section tight">
        <div className="wrap border-box">
          <div className="section-head reveal">
            <h2>Collection</h2>
            <p>From deep Cambodian ouds to fleeting Taif roses. Our entire olfactive library, meticulously bottled.</p>
          </div>

          <div className="filter-row reveal">
            <div className="chip active">All</div>
            <div className="chip">Oud</div>
            <div className="chip">Floral</div>
            <div className="chip">Musk</div>
            <div className="chip">Woody</div>
          </div>

          
            {products.length === 0 ? (
              <div className="empty-state">
                <style dangerouslySetInnerHTML={{__html: `
                  .empty-state { padding: 80px 0; text-align: center; color: var(--muted-on-linen); }
                  .empty-state h3 { font-size: 24px; margin-bottom: 12px; color: var(--obsidian); }
                `}} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="asym-grid reveal">
                {products.map((p, i) => {
                  const hasImage = p.images && p.images.length > 0;
                  const imageUrl = hasImage ? p.images[0].blob_url : null;
                  const altText = hasImage ? (p.images[0].alt_text || p.name) : p.name;
                  
                  return (
                    <Link href={`/product/${p.slug}`} className={`prod-card ${i === 0 ? 'wide' : ''}`} key={p.id}>
                      <div className="prod-eyebrow">{p.family}</div>
                      <div className="prod-vial-row" style={{ position: 'relative' }}>
                        {imageUrl ? (
                          <div style={{ position: 'relative', width: '56px', height: '104px' }}>
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
                          <div className="vial"></div>
                        )}
                      </div>
                      <div>
                        <h3>{p.name}</h3>
                        <div className="prod-notes">Fine Attar / {p.size}</div>
                        <div className="prod-foot">
                          <span className="price">{p.currency} {p.price}</span>
                          <div className="prod-arrow">↗</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          
        </div>
      </section>
    </div>
  );
}
