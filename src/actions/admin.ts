'use server'

import { Product } from '@prisma/client'
import { put } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { updateTag } from 'next/cache'
import { productSchema, ProductInput } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export type { ProductInput }

export async function createProduct(data: ProductInput): Promise<Product> {
  const parsed = productSchema.parse(data)
  const { notes, metrics, images, ...productData } = parsed

  const product = await prisma.product.create({
    data: {
      ...productData,
      notes: {
        create: notes || [],
      },
      metrics: metrics ? {
        create: metrics,
      } : undefined,
      images: {
        create: (images || []).map(img => ({
          ...img,
          entity_type: img.entity_type || 'product',
          entity_id: img.entity_id || 'pending',
        })),
      },
    },
    include: {
      notes: true,
      metrics: true,
      images: true,
    },
  })

  if (images && images.length > 0) {
    await prisma.images.updateMany({
      where: { productId: product.id, entity_id: 'pending' },
      data: { entity_id: product.id },
    })
  }

  updateTag('products')
  return product
}

export async function updateProduct(id: string, data: Partial<ProductInput>): Promise<Product> {
  await requireAdmin()
  const parsed = productSchema.partial().parse(data)
  const { notes, metrics, images, ...productData } = parsed

  if (notes) {
    await prisma.productNotes.deleteMany({ where: { productId: id } })
  }
  if (metrics) {
    await prisma.productMetrics.deleteMany({ where: { productId: id } })
  }
  if (images) {
    await prisma.images.deleteMany({ where: { productId: id } })
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      notes: notes ? { create: notes } : undefined,
      metrics: metrics ? { create: metrics } : undefined,
      images: images ? {
        create: images.map(img => ({
          ...img,
          entity_type: img.entity_type || 'product',
          entity_id: img.entity_id || id,
        })),
      } : undefined,
    },
    include: {
      notes: true,
      metrics: true,
      images: true,
    },
  })

  updateTag('products')
  updateTag('product')
  return product
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  await prisma.product.delete({ where: { id } })
  updateTag('products')
  updateTag('product')
}

export async function toggleProductActive(id: string) {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  await prisma.product.update({
    where: { id },
    data: { is_active: !product.is_active },
  })
  updateTag('products')
  updateTag('product')
}

export async function toggleProductFeatured(id: string) {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  await prisma.product.update({
    where: { id },
    data: { is_featured: !product.is_featured },
  })
  updateTag('products')
}

export async function uploadImage(file: FormData): Promise<{ blob_url: string }> {
  await requireAdmin()
  const image = file.get('file') as File
  if (!image) throw new Error('No file provided')

  const blob = await put(image.name, image, {
    access: 'public',
  })

  return { blob_url: blob.url }
}
