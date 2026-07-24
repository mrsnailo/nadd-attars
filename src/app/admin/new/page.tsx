import ProductForm from '../components/ProductForm'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="wrap" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/admin" style={{ textDecoration: 'underline' }}>&larr; Back to Admin</Link>
      </div>
      <h2>New Product</h2>
      <ProductForm />
    </div>
  )
}
