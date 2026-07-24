'use server'

import prisma from '@/lib/prisma'
import { updateTag } from 'next/cache'
import { categorySchema, CategoryInput } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function createCategory(data: CategoryInput) {
  await requireAdmin()
  const parsed = categorySchema.parse(data)
  const category = await prisma.category.create({ data: parsed })
  updateTag('categories')
  return category
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  await requireAdmin()
  const parsed = categorySchema.partial().parse(data)
  const category = await prisma.category.update({ where: { id }, data: parsed })
  updateTag('categories')
  return category
}

export async function deleteCategory(id: string) {
  await requireAdmin()
  await prisma.product.updateMany({ where: { category_id: id }, data: { category_id: null } })
  await prisma.category.delete({ where: { id } })
  updateTag('categories')
  updateTag('products')
}
