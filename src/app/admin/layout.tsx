import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <header style={{ background: '#000', color: '#D4AF37', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
          NAḎḎ Admin
        </Link>
        <Link href="/" style={{ color: '#fff' }}>Go to Storefront</Link>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
