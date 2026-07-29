import prisma from './prisma'
import { unstable_cache } from 'next/cache'

// ─── PRODUCTS ─────────────────────────────────────────────────────

const productListIncludes = {
  images: {
    where: { entity_type: 'product' as const },
    orderBy: { display_order: 'asc' as const },
    take: 1,
  },
  notes: true as const,
  metrics: true as const,
  category: { select: { id: true, name: true, slug: true } },
}

function serializeProduct<T extends { price: unknown; compare_at_price?: unknown }>(p: T) {
  return {
    ...p,
    price: Number(p.price),
    compare_at_price: (p as { compare_at_price?: unknown }).compare_at_price
      ? Number((p as { compare_at_price?: unknown }).compare_at_price)
      : null,
  }
}

export const getProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      include: productListIncludes,
    })
    return products.map(serializeProduct)
  },
  ['get-products'],
  { tags: ['products'], revalidate: 3600 }
)

export async function getFilteredProducts(opts: {
  categorySlug?: string
  family?: string
  featured?: boolean
  limit?: number
}) {
  const products = await prisma.product.findMany({
    where: {
      is_active: true,
      ...(opts.featured !== undefined && { is_featured: opts.featured }),
      ...(opts.family && { family: opts.family }),
      ...(opts.categorySlug && { category: { slug: opts.categorySlug } }),
    },
    orderBy: { created_at: 'desc' },
    take: opts.limit,
    include: productListIncludes,
  })
  return products.map(serializeProduct)
}

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          where: { entity_type: 'product' },
          orderBy: { display_order: 'asc' },
        },
        notes: { orderBy: { time: 'asc' } },
        metrics: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!product) return null

    return {
      ...product,
      price: Number(product.price),
      compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
    }
  },
  ['get-product-by-slug'],
  { tags: ['product'], revalidate: 3600 }
)

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { display_order: 'asc' } },
      notes: { orderBy: { time: 'asc' } },
      metrics: true,
      category: true,
    },
  })

  if (!product) return null

  return {
    ...product,
    price: Number(product.price),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
  }
}

export const getAllProductsAdmin = async () => {
  const products = await prisma.product.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      images: { orderBy: { display_order: 'asc' }, take: 1 },
      category: { select: { name: true } },
    },
  })
  return products.map(p => ({
    ...p,
    price: Number(p.price),
  }))
}

// ─── CATEGORIES ───────────────────────────────────────────────────

export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        _count: { select: { products: true } },
        children: { where: { is_active: true }, orderBy: { sort_order: 'asc' } },
      },
    })
  },
  ['get-categories'],
  { tags: ['categories'], revalidate: 3600 }
)

export const getAllCategoriesAdmin = async () => {
  return prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      _count: { select: { products: true } },
      parent: { select: { name: true } },
    },
  })
}

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { is_active: true },
          include: {
            images: { orderBy: { display_order: 'asc' }, take: 1 },
          },
        },
      },
    })
  },
  ['get-category-by-slug'],
  { tags: ['categories'], revalidate: 3600 }
)

// ─── ORDERS ───────────────────────────────────────────────────────

export const getOrdersAdmin = async (opts?: { status?: string; limit?: number; offset?: number }) => {
  return prisma.order.findMany({
    where: opts?.status ? { status: opts.status as never } : undefined,
    orderBy: { created_at: 'desc' },
    take: opts?.limit ?? 50,
    skip: opts?.offset ?? 0,
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      shipping_address: true,
      coupon: { select: { code: true } },
    },
  })
}

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, slug: true, images: { take: 1 } } } } },
      shipping_address: true,
      billing_address: true,
      coupon: true,
      user: { select: { name: true, email: true } },
    },
  })
}

export const getOrderByNumber = async (orderNumber: string) => {
  return prisma.order.findUnique({
    where: { order_number: orderNumber },
    include: {
      items: true,
      shipping_address: true,
    },
  })
}

export const getOrderStats = async () => {
  const [total, pending, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { payment_status: 'PAID' },
    }),
  ])
  return { total, pending, revenue: Number(revenue._sum.total ?? 0) }
}

// ─── COUPONS ──────────────────────────────────────────────────────

export const getCouponsAdmin = async () => {
  return prisma.coupon.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { orders: true } } },
  })
}

export const validateCoupon = async (code: string, orderSubtotal: number) => {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon) return { valid: false, error: 'Coupon not found' } as const
  if (!coupon.is_active) return { valid: false, error: 'Coupon is inactive' } as const
  if (coupon.valid_until && coupon.valid_until < new Date()) return { valid: false, error: 'Coupon expired' } as const
  if (coupon.valid_from > new Date()) return { valid: false, error: 'Coupon not yet valid' } as const
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return { valid: false, error: 'Coupon usage limit reached' } as const
  if (coupon.min_order_value && orderSubtotal < Number(coupon.min_order_value)) {
    return { valid: false, error: `Minimum order value is ${Number(coupon.min_order_value)}` } as const
  }

  const discount = coupon.discount_type === 'PERCENTAGE'
    ? orderSubtotal * (Number(coupon.discount_value) / 100)
    : Number(coupon.discount_value)

  return { valid: true, coupon, discount: Math.min(discount, orderSubtotal) } as const
}

// ─── CART ──────────────────────────────────────────────────────────

export const getCart = async (sessionId: string, userId?: string) => {
  const cart = await prisma.cart.findFirst({
    where: userId ? { user_id: userId } : { session_id: sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { display_order: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  })

  if (!cart) return null

  return {
    ...cart,
    items: cart.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })),
  }
}

// ─── STORE SETTINGS ───────────────────────────────────────────────

export const getStoreSettings = unstable_cache(
  async () => {
    let settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: 'default' },
      })
    }
    return {
      ...settings,
      free_shipping_threshold: settings.free_shipping_threshold ? Number(settings.free_shipping_threshold) : null,
      tax_rate: Number(settings.tax_rate),
    }
  },
  ['store-settings'],
  { tags: ['store-settings'], revalidate: 3600 }
)

// ─── DASHBOARD STATS ──────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [productCount, orderStats, lowStock, recentOrders] = await Promise.all([
    prisma.product.count({ where: { is_active: true } }),
    getOrderStats(),
    prisma.product.findMany({
      where: { stock_count: { lte: 5 }, is_active: true },
      select: { id: true, name: true, stock_count: true },
      orderBy: { stock_count: 'asc' },
      take: 10,
    }),
    prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        order_number: true,
        customer_name: true,
        total: true,
        status: true,
        created_at: true,
      },
    }),
  ])

  return {
    productCount,
    ...orderStats,
    lowStock,
    recentOrders: recentOrders.map(o => ({ ...o, total: Number(o.total) })),
  }
}
