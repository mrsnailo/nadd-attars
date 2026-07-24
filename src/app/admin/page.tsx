export const dynamic = 'force-dynamic'

import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { seedDatabase } from '@/actions/seed'

const prisma = new PrismaClient()

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="wrap" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <form action={seedDatabase}>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#1c1c1e', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Seed DB
            </button>
          </form>
          <Link href="/admin/new" style={{ padding: '0.5rem 1rem', background: '#D4AF37', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            + New Product
          </Link>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#F5F3EF', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>Name</th>
            <th style={{ padding: '1rem' }}>Slug</th>
            <th style={{ padding: '1rem' }}>Price</th>
            <th style={{ padding: '1rem' }}>Stock</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '1rem' }}>{p.id.slice(-6)}</td>
              <td style={{ padding: '1rem' }}>{p.name}</td>
              <td style={{ padding: '1rem' }}>{p.slug}</td>
              <td style={{ padding: '1rem' }}>{p.price.toString()} {p.currency}</td>
              <td style={{ padding: '1rem' }}>{p.stock_count}</td>
              <td style={{ padding: '1rem' }}>
                <Link href={`/admin/${p.id}`} style={{ textDecoration: 'underline' }}>Edit</Link>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
