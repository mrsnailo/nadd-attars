export const dynamic = 'force-dynamic'

import ProductForm from '../components/ProductForm'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, notes: true, metrics: true }
  })

  if (!product) {
    return notFound()
  }

  return (
    <div className="wrap" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/admin" style={{ textDecoration: 'underline' }}>&larr; Back to Admin</Link>
      </div>
      <h2>Edit Product: {product.name}</h2>
      <ProductForm initialData={product} />
    </div>
  )
}
