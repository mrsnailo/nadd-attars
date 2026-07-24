'use server'

import { PrismaClient, Product } from '@prisma/client'
import { put } from '@vercel/blob'

// Use a singleton for Prisma to avoid exhausting connection limits in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type ProductInput = Omit<Product, 'id' | 'created_at'> & {
  notes?: { time: string; tag: string; notes: string; description: string }[]
  metrics?: { longevity: string; sillage: string; intensity: string; best_in: string }
  images?: { entity_type: string; entity_id?: string; blob_url: string; display_order: number; alt_text: string | null }[]
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const { notes, metrics, images, ...productData } = data

  const product = await prisma.product.create({
    data: {
      ...productData,
      notes: {
        create: notes || []
      },
      metrics: metrics ? {
        create: metrics
      } : undefined,
      images: {
        create: (images || []).map(img => ({
          ...img,
          entity_type: img.entity_type || 'product',
          entity_id: img.entity_id || 'pending' 
        }))
      }
    },
    include: {
      notes: true,
      metrics: true,
      images: true,
    }
  })

  // Update images to have the correct entity_id if they were pending
  if (images && images.length > 0) {
    await prisma.images.updateMany({
      where: { productId: product.id, entity_id: 'pending' },
      data: { entity_id: product.id }
    })
  }

  return product
}

export async function updateProduct(id: string, data: Partial<ProductInput>): Promise<Product> {
  const { notes, metrics, images, ...productData } = data

  // For simplicity in this MVP, we delete existing nested records and recreate them
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
          entity_id: img.entity_id || id
        }))
      } : undefined
    },
    include: {
      notes: true,
      metrics: true,
      images: true,
    }
  })

  return product
}

export async function uploadImage(file: FormData): Promise<{ blob_url: string }> {
  const image = file.get('file') as File
  if (!image) throw new Error('No file provided')

  const blob = await put(image.name, image, {
    access: 'public',
  })

  return { blob_url: blob.url }
}
