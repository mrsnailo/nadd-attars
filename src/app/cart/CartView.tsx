'use client'

import { useTransition, useEffect } from 'react'
import { updateCartItem, removeFromCart } from '@/actions/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    size: string
    batch_no?: string
    price: string | number
    images?: { blob_url: string; alt_text?: string }[]
  }
}

type CartData = {
  session_id: string
  items: CartItem[]
}


const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default function CartView({ initialCart }: { initialCart: CartData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Optimistic UI state just for smooth updates
  const items = initialCart?.items || []
  
  const threshold = 20000
  let total = 0
  let count = 0

  items.forEach((item: CartItem) => {
    const price = Number(item.product.price)
    total += price * item.quantity
    count += item.quantity
  })

  useEffect(() => {
    const counts = document.querySelectorAll('[data-cart-count]')
    counts.forEach(c => { c.textContent = String(count) })
  }, [count])

  const progress = Math.min(100, Math.max(0, (total / threshold) * 100))
  const remaining = Math.max(0, threshold - total)
  const isFree = progress >= 100
  const shippingAmount = isFree ? 0 : 500
  const grandTotal = total + shippingAmount

  const handleUpdate = (productId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 9) quantity = 9;
    startTransition(() => {
      updateCartItem(initialCart.session_id, productId, quantity).then(() => {
        router.refresh()
      })
    })
  }

  const handleRemove = (productId: string) => {
    startTransition(() => {
      removeFromCart(initialCart.session_id, productId).then(() => {
        router.refresh()
      })
    })
  }

  const formatPrice = (num: number) => "৳ " + num.toLocaleString('en-US')

  return (
    <main id="content" data-od-id="page-cart">
      <style dangerouslySetInnerHTML={{__html: `
        .seg {
          display: inline-grid; grid-auto-flow: column;
          gap: var(--hairline);
          background: var(--rule-strong);
          border: var(--hairline) solid var(--rule-strong);
        }
        .seg__opt {
          display: grid; place-items: center; justify-items: center; align-content: center;
          padding: 0 var(--s-5); min-width: 44px; height: 44px;
          background: var(--bg);
          transition: background-color var(--dur-2) var(--ease-out), color var(--dur-1) var(--ease-out);
        }
        button.seg__opt:hover:not([disabled]) { background: var(--surface); }
        .seg__size { font-size: var(--t-body); font-weight: var(--w-body-medium); }
        .seg__opt[disabled] { cursor: not-allowed; color: var(--rule-strong); }

        .pd {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: var(--s-10);
          align-items: start;
        }
        .pd__col { display: grid; gap: var(--s-8); }

        .cart__header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-5); border-bottom: var(--hairline) solid var(--rule-strong); padding-bottom: var(--s-5); }
        .cart__header h1 { font-family: var(--font-display); font-size: var(--t-d1); line-height: var(--lh-display); }

        .cart__list { display: grid; }
        .cart__line {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr) auto 110px;
          gap: var(--s-6);
          padding-block: var(--s-7);
          border-bottom: var(--line-light);
          align-items: center;
          transform-origin: top;
          will-change: transform, max-height, opacity, padding;
          transition: transform var(--dur-3) var(--ease-out), max-height var(--dur-3) var(--ease-out), padding var(--dur-3) var(--ease-out), opacity var(--dur-3) var(--ease-out);
          max-height: 250px;
          overflow: hidden;
        }
        .cart__line.loading { opacity: 0.5; pointer-events: none; }

        .cart__meta { display: grid; gap: var(--s-2); align-self: center; }
        .cart__meta .six__name { margin-top: 0; font-size: var(--t-d4); }
        .cart__qty { display: grid; align-items: center; justify-items: center; }
        .cart__total { display: grid; gap: var(--s-4); justify-items: end; text-align: right; }
        .cart__remove { font-size: var(--t-small); color: var(--muted); text-decoration: underline; text-underline-offset: 4px; transition: color var(--dur-2) var(--ease-out); background: none; border: none; cursor: pointer; padding: 0; }
        .cart__remove:hover { color: var(--fg); }

        .summary {
          position: sticky;
          top: calc(var(--nav-h) + var(--s-6));
          background: var(--surface);
          border: var(--line-light);
          padding: var(--s-9) var(--s-7) var(--s-7);
          display: grid; gap: var(--s-8);
        }
        .summary h2 { border-bottom: var(--line-light); padding-bottom: var(--s-4); margin: 0; }
        .summary__rows { display: grid; gap: var(--s-5); }
        .summary__row { display: flex; justify-content: space-between; align-items: baseline; font-size: var(--t-body); }
        .summary__row--total { padding-top: var(--s-5); border-top: var(--line-light); }

        .empty { gap: var(--s-4); padding: var(--s-9) 0; }
        .empty h3 { max-width: 22ch; margin: 0; }

        @media (max-width: 820px) {
          .pd { grid-template-columns: 1fr; gap: var(--s-8); }
          .summary { position: static; padding: var(--s-7) var(--s-6) var(--s-6); }
          .cart__line { grid-template-columns: 44px minmax(0, 1fr); grid-template-areas: "thumb meta" ". qty" ". total"; gap: var(--s-5); align-items: start; }
          .cart__thumb { grid-area: thumb; }
          .cart__meta { grid-area: meta; }
          .cart__qty { grid-area: qty; justify-items: start; }
          .cart__total { grid-area: total; justify-items: start; display: flex; align-items: baseline; justify-content: space-between; width: 100%; flex-direction: row-reverse; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cart__line { transition: none; will-change: auto; }
        }
      `}} />

      <section className="section wrap" data-od-id="cart-view">
        {count === 0 ? (
          <div className="empty" style={{ display: 'grid' }} id="cart-empty" data-od-id="cart-empty">
            <p className="eyebrow">Archive</p>
            <h3 className="six__name">No allocations requested.</h3>
            <div className="six__spec">
              <p>Explore the <Link href="/collection" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', color: 'var(--fg)' }}>collection</Link> or consult the <Link href="/finder" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', color: 'var(--fg)' }}>finder</Link>.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="cart__header" id="cart-header">
              <h1>Allocations</h1>
              <p className="eyebrow" data-motion="mask">Dhaka Archive</p>
            </div>

            <div className="pd" id="cart-content">
              
              <div className="pd__col cart__list" id="cart-list" data-od-id="cart-list" style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                {items.map((item: CartItem) => {
                  const product = item.product;
                  const hasImage = product.images && product.images.length > 0;
                  const imageUrl = hasImage ? product.images[0].blob_url : null;
                  const altText = hasImage && product.images[0].alt_text ? product.images[0].alt_text : product.name;
                  const itemPrice = Number(product.price);
                  
                  return (
                  <article key={item.id} className="cart__line" data-price={itemPrice} data-od-id={`cart-item-${item.id}`}>
                    <div className="cart__thumb">
                      {imageUrl ? (
                        <div style={{ position: 'relative', width: '44px', height: '100px' }}>
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
                        <div className="vial vial--sm" role="img" aria-label={`A ${product.size} ${product.name} vial`}>
                          <span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span>
                        </div>
                      )}
                    </div>
                    <div className="cart__meta">
                      <h2 className="six__name">{product.name}</h2>
                      <div className="six__spec">
                        <p>Size: <b className="num">{product.size}</b></p>
                        <p>Batch: <b className="num">{product.batch_no || '---'}</b></p>
                      </div>
                    </div>
                    <div className="cart__qty">
                      <div className="seg" role="group" aria-label="Quantity stepper">
                        <button className="seg__opt" type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1 || isPending} onClick={() => handleUpdate(product.id, item.quantity - 1)}><span className="seg__size">—</span></button>
                        <span className="seg__opt"><span className="seg__size num">{item.quantity}</span></span>
                        <button className="seg__opt" type="button" aria-label="Increase quantity" disabled={item.quantity >= 9 || isPending} onClick={() => handleUpdate(product.id, item.quantity + 1)}><span className="seg__size">+</span></button>
                      </div>
                    </div>
                    <div className="cart__total">
                      <span className="six__price num">{formatPrice(itemPrice * item.quantity)}</span>
                      <button className="cart__remove" type="button" disabled={isPending} onClick={() => handleRemove(product.id)}>Remove</button>
                    </div>
                  </article>
                )})}
              </div>

              <aside className="summary" data-od-id="cart-summary">
                <h2 className="label">Summary</h2>
                
                <div className="summary__rows">
                  <div className="summary__row">
                    <span>Subtotal</span>
                    <span className="six__price num">{formatPrice(total)}</span>
                  </div>
                  <div className="summary__row">
                    <span>Shipping to Dhaka</span>
                    <span className="num eyebrow">{isFree ? 'Free' : formatPrice(shippingAmount)}</span>
                  </div>
                  <div className="summary__row summary__row--total">
                    <span className="eyebrow">Total</span>
                    <span className="six__price num">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="perf" data-od-id="free-shipping-bar">
                  <div className="perf__row">
                    <div className="perf__label"><strong>Shipping</strong><span>Threshold at ৳ 20,000</span></div>
                    <div className="perf__scale" aria-hidden="true">
                      <i style={{ left: 0 }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar" style={{ '--v': progress } as React.CSSProperties}></span>
                    </div>
                    <p className="perf__val" style={{ color: isFree ? 'var(--gold-ink)' : 'var(--fg)' }}>
                      {isFree ? 'Free threshold met' : (
                        <>{formatPrice(remaining)} <small>to free threshold</small></>
                      )}
                    </p>
                  </div>
                </div>

                <button className="btn-gold" type="button">Checkout</button>
              </aside>

            </div>
          </>
        )}
      </section>
    </main>
  )
}
