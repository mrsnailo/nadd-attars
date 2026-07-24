'use server'

import prisma from '@/lib/prisma'
import { couponSchema, CouponInput } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function createCoupon(data: CouponInput) {
  await requireAdmin()
  const parsed = couponSchema.parse(data)
  const coupon = await prisma.coupon.create({ data: parsed })
  return coupon
}

export async function updateCoupon(id: string, data: Partial<CouponInput>) {
  await requireAdmin()
  const parsed = couponSchema.partial().parse(data)
  const coupon = await prisma.coupon.update({ where: { id }, data: parsed })
  return coupon
}

export async function deleteCoupon(id: string) {
  await requireAdmin()
  await prisma.coupon.delete({ where: { id } })
}

export async function toggleCoupon(id: string) {
  await requireAdmin()
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) throw new Error('Coupon not found')
  return prisma.coupon.update({
    where: { id },
    data: { is_active: !coupon.is_active },
  })
}
