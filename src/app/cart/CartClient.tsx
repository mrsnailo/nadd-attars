"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./page.css";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export default function CartClient() {
  const [items, setItems] = useState([
    { id: 1, name: "Mālik Oud", size: 3, batch: "041", price: 9800, qty: 1 },
    { id: 2, name: "Rūh Khus", size: 6, batch: "039", price: 12400, qty: 1 },
    { id: 3, name: "Attar Shamama", size: 12, batch: "040", price: 15200, qty: 1 }
  ]);

  const threshold = 20000;
  
  const total = items.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const count = items.reduce((acc, it) => acc + it.qty, 0);
  
  useEffect(() => {
    window.localStorage.setItem("nadd-vials", String(count));
    const countEls = document.querySelectorAll("[data-cart-count]");
    countEls.forEach(el => el.textContent = count < 10 ? "0" + count : String(count));
  }, [count]);

  const updateQty = (id: number, delta: number) => {
    setItems(items.map(it => {
        if (it.id === id) {
           let v = it.qty + delta;
           if (v < 1) v = 1;
           if (v > 9) v = 9;
           return { ...it, qty: v };
        }
        return it;
    }));
  };

  const removeItem = (id: number) => {
    const row = document.getElementById("cart-item-" + id);
    if(row) {
        row.classList.add('cart__line--remove');
        setTimeout(() => {
            setItems(prev => prev.filter(it => it.id !== id));
        }, 900);
    } else {
        setItems(prev => prev.filter(it => it.id !== id));
    }
  };

  const progress = (total / threshold) * 100;
  function formatPrice(num: number) {
    return "৳ " + num.toLocaleString('en-US');
  }

  return (
    <main id="content" data-od-id="page-cart">
      <section className="section wrap" data-od-id="cart-view">
        
        {count > 0 && (
            <div className="cart__header" id="cart-header">
              <h1>Allocations</h1>
              <p className="eyebrow" data-motion="mask">Dhaka Archive</p>
            </div>
        )}

        {count === 0 && (
            <div className="empty" id="cart-empty" data-od-id="cart-empty" style={{ display: 'grid' }}>
              <p className="eyebrow">Archive</p>
              <h3 className="six__name">No allocations requested.</h3>
              <div className="six__spec">
                <p>Explore the <Link href="/collection" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', color: 'var(--fg)' }}>collection</Link> or consult the <Link href="/finder" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', color: 'var(--fg)' }}>finder</Link>.</p>
              </div>
            </div>
        )}

        {count > 0 && (
            <div className="pd" id="cart-content">
              
              <div className="pd__col cart__list" id="cart-list" data-od-id="cart-list">
                {items.map(it => (
                    <article key={it.id} className="cart__line" id={`cart-item-${it.id}`} data-price={it.price} data-od-id={`cart-item-${it.id}`}>
                      <div className="cart__thumb">
                        <div className="vial vial--sm" role="img" aria-label={`A ${it.size} millilitre ${it.name} vial`}>
                          <span className="vial__cap"></span><span className="vial__neck"></span><span className="vial__body"></span>
                        </div>
                      </div>
                      <div className="cart__meta">
                        <h2 className="six__name">{it.name}</h2>
                        <div className="six__spec">
                          <p>Size: <b className="num">{it.size} ml</b></p>
                          <p>Batch: <b className="num">{it.batch}</b></p>
                        </div>
                      </div>
                      <div className="cart__qty">
                        <div className="seg" role="group" aria-label="Quantity stepper">
                          <button className="seg__opt" type="button" aria-label="Decrease quantity" data-action="minus" disabled={it.qty <= 1} onClick={() => updateQty(it.id, -1)}><span className="seg__size">—</span></button>
                          <span className="seg__opt"><span className="seg__size num" data-val="true">{it.qty}</span></span>
                          <button className="seg__opt" type="button" aria-label="Increase quantity" data-action="plus" onClick={() => updateQty(it.id, 1)}><span className="seg__size">+</span></button>
                        </div>
                      </div>
                      <div className="cart__total">
                        <span className="six__price num" data-sub="true">{formatPrice(it.price * it.qty)}</span>
                        <button className="cart__remove" type="button" onClick={() => removeItem(it.id)}>Remove</button>
                      </div>
                    </article>
                ))}
              </div>

              <aside className="summary" data-od-id="cart-summary">
                <h2 className="label">Summary</h2>
                
                <div className="summary__rows">
                  <div className="summary__row">
                    <span>Subtotal</span>
                    <span className="six__price num" id="sum-sub">{formatPrice(total)}</span>
                  </div>
                  <div className="summary__row">
                    <span>Shipping to Dhaka</span>
                    <span className="num eyebrow" id="sum-ship">{progress >= 100 ? "Free" : formatPrice(500)}</span>
                  </div>
                  <div className="summary__row summary__row--total">
                    <span className="eyebrow">Total</span>
                    <span className="six__price num" id="sum-tot">{formatPrice(total + (progress >= 100 ? 0 : 500))}</span>
                  </div>
                </div>

                <div className="perf" data-od-id="free-shipping-bar">
                  <div className="perf__row">
                    <div className="perf__label"><strong>Shipping</strong><span>Threshold at ৳ 20,000</span></div>
                    <div className="perf__scale" aria-hidden="true">
                      <i style={{ left: 0 }}></i><i style={{ left: '25%' }}></i><i style={{ left: '50%' }}></i><i style={{ left: '75%' }}></i><i style={{ left: 'calc(100% - 1px)' }}></i>
                      <span className="perf__bar" id="ship-bar" style={{ '--v': Math.max(0, Math.min(100, progress)) } as any}></span>
                    </div>
                    {progress >= 100 ? (
                        <p className="perf__val" id="ship-text" style={{ color: 'var(--gold-ink)' }}>Free threshold met</p>
                    ) : (
                        <p className="perf__val" id="ship-text" style={{ color: 'var(--fg)' }}>{formatPrice(threshold - total)}<small>to free threshold</small></p>
                    )}
                  </div>
                </div>

                <button className="btn-gold" type="button">Checkout</button>
              </aside>
            </div>
        )}
      </section>
    </main>
  );
}
