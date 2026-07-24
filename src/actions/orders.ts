'use server'

import prisma from '@/lib/prisma'
import { orderUpdateSchema, type OrderUpdateInput } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function updateOrder(id: string, data: OrderUpdateInput) {
  await requireAdmin()
  const parsed = orderUpdateSchema.parse(data)
  const order = await prisma.order.update({ where: { id }, data: parsed })
  return order
}

export async function cancelOrder(id: string) {
  await requireAdmin()
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) throw new Error('Order not found')

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new Error(`Cannot cancel order with status ${order.status}`)
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.product_id },
        data: { stock_count: { increment: item.quantity } },
      })
    }

    await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED', payment_status: 'REFUNDED' },
    })
  })
}

export async function deleteOrder(id: string) {
  await requireAdmin()
  await prisma.order.delete({ where: { id } })
}
