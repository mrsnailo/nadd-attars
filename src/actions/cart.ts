'use server'

import prisma from '@/lib/prisma'
import { checkoutSchema, CheckoutInput } from '@/lib/validations'

function generateOrderNumber(): string {
  const prefix = 'NADD'
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${ts}-${rand}`
}

export async function getOrCreateCart(sessionId: string, userId?: string) {
  let cart = await prisma.cart.findFirst({
    where: userId ? { user_id: userId } : { session_id: sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { display_order: 'asc' }, take: 1 } },
          },
        },
      },
    },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        session_id: sessionId,
        user_id: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { display_order: 'asc' }, take: 1 } },
            },
          },
        },
      },
    })
  }

  return cart
}

export async function addToCart(sessionId: string, productId: string, quantity: number = 1) {
  const cart = await getOrCreateCart(sessionId)

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.is_active) throw new Error('Product not available')
  if (product.stock_count < quantity) throw new Error('Insufficient stock')

  const existing = cart.items.find(i => i.product_id === productId)

  if (existing) {
    const newQty = existing.quantity + quantity
    if (product.stock_count < newQty) throw new Error('Insufficient stock')
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        quantity,
      },
    })
  }

  return getOrCreateCart(sessionId)
}

export async function updateCartItem(sessionId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(sessionId)

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id, product_id: productId },
    })
  } else {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || product.stock_count < quantity) throw new Error('Insufficient stock')

    await prisma.cartItem.updateMany({
      where: { cart_id: cart.id, product_id: productId },
      data: { quantity },
    })
  }

  return getOrCreateCart(sessionId)
}

export async function removeFromCart(sessionId: string, productId: string) {
  const cart = await getOrCreateCart(sessionId)
  await prisma.cartItem.deleteMany({
    where: { cart_id: cart.id, product_id: productId },
  })
  return getOrCreateCart(sessionId)
}

export async function clearCart(sessionId: string) {
  const cart = await getOrCreateCart(sessionId)
  await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } })
}

export async function checkout(sessionId: string, data: CheckoutInput, userId?: string) {
  const parsed = checkoutSchema.parse(data)
  const cart = await getOrCreateCart(sessionId, userId)

  if (cart.items.length === 0) throw new Error('Cart is empty')

  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const taxRate = settings ? Number(settings.tax_rate) : 0

  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0
    const processedItems = []

    for (const item of cart.items) {
      const product = await tx.product.findUnique({ where: { id: item.product_id } })
      if (!product || !product.is_active) throw new Error(`Product ${item.product_id} not available`)
      if (product.stock_count < item.quantity) throw new Error(`Insufficient stock for ${product.name}`)
      
      const itemTotal = Number(product.price) * item.quantity
      subtotal += itemTotal
      processedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
      })
    }

    let discountAmount = 0
    let couponId: string | undefined
    if (parsed.coupon_code) {
      const code = parsed.coupon_code.toUpperCase()
      const coupon = await tx.coupon.findUnique({ where: { code } })
      
      if (!coupon) throw new Error('Coupon not found')
      if (!coupon.is_active) throw new Error('Coupon is inactive')
      if (coupon.valid_until && coupon.valid_until < new Date()) throw new Error('Coupon expired')
      if (coupon.valid_from > new Date()) throw new Error('Coupon not yet valid')
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) throw new Error('Coupon usage limit reached')
      if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
        throw new Error(`Minimum order value is ${Number(coupon.min_order_value)}`)
      }

      const discount = coupon.discount_type === 'PERCENTAGE'
        ? subtotal * (Number(coupon.discount_value) / 100)
        : Number(coupon.discount_value)

      discountAmount = Math.min(discount, subtotal)
      couponId = coupon.id
    }

    const taxAmount = (subtotal - discountAmount) * (taxRate / 100)
    const shippingAmount = 0
    const total = subtotal - discountAmount + taxAmount + shippingAmount

    const shippingAddr = await tx.address.create({
      data: {
        ...parsed.shipping_address,
        user_id: userId,
      },
    })

    let billingAddrId: string | undefined
    if (parsed.billing_address) {
      const billingAddr = await tx.address.create({
        data: {
          ...parsed.billing_address,
          user_id: userId,
        },
      })
      billingAddrId = billingAddr.id
    }

    const ord = await tx.order.create({
      data: {
        order_number: generateOrderNumber(),
        user_id: userId,
        customer_email: parsed.customer_email,
        customer_name: parsed.customer_name,
        customer_phone: parsed.customer_phone,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total,
        shipping_address_id: shippingAddr.id,
        billing_address_id: billingAddrId,
        coupon_id: couponId,
        payment_method: parsed.payment_method,
        notes: parsed.notes,
        items: {
          create: processedItems
        },
      },
      include: { items: true },
    })

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.product_id },
        data: { stock_count: { decrement: item.quantity } },
      })
    }

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { used_count: { increment: 1 } },
      })
    }

    await tx.cartItem.deleteMany({ where: { cart_id: cart.id } })

    return ord
  })

  return order
}
