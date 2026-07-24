import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="wrap border-box">
      <div className="breadcrumb reveal"><Link href="/">Home</Link> / Bag</div>
      
      <section className="section tight" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: 'clamp(34px, 4vw, 56px)', fontFamily: 'Cormorant Garamond, serif', marginBottom: '24px' }}>Your Bag is Empty</h2>
        <p style={{ color: 'var(--muted-on-linen)', marginBottom: '32px', textAlign: 'center' }}>You haven&apos;t added any dossiers to your collection yet.</p>
        
        <Link href="/collection" className="btn-gold" style={{ alignSelf: 'center' }}>
          Continue Shopping <span>→</span>
        </Link>
      </section>
    </div>
  );
}
