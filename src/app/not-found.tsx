import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', background: 'var(--obsidian)' }}>
      <div className="hero-vial-wrap" style={{ margin: '0 auto 40px', justifyContent: 'center' }}>
        <div className="vial" style={{ opacity: 0.5 }}></div>
      </div>
      <h2 style={{ fontSize: 'clamp(34px, 4vw, 56px)', fontFamily: 'Cormorant Garamond, serif', marginBottom: '24px', color: 'var(--linen)' }}>Note Not Found</h2>
      <p style={{ color: 'var(--muted-on-dark)', marginBottom: '32px', maxWidth: '400px' }}>The olfactory profile you are seeking has eluded us. It may have been archived or the URL might be incorrect.</p>
      <Link href="/collection" className="btn-line on-dark">
        Return to Collection
      </Link>
    </div>
  );
}
