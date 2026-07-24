import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  price: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()),
  compare_at_price: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()).nullable().optional(),
  currency: z.string().length(3).default('USD'),
  size: z.string().min(1),
  family: z.string().min(1),
  stock_count: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  description: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  concentration: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  extraction: z.string().nullable().optional(),
  batch_no: z.string().nullable().optional(),
  aged_time: z.string().nullable().optional(),
  ingredients: z.string().nullable().optional(),
  how_to_wear_instructions: z.string().nullable().optional(),
  shipping_rules: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  weight_grams: z.number().int().positive().nullable().optional(),
  category_id: z.string().cuid().nullable().optional(),
  notes: z.array(z.object({
    time: z.string().min(1),
    tag: z.string().min(1),
    notes: z.string().min(1),
    description: z.string().min(1),
  })).optional(),
  metrics: z.object({
    longevity: z.string().min(1),
    sillage: z.string().min(1),
    intensity: z.string().min(1),
    best_in: z.string().min(1),
  }).optional(),
  images: z.array(z.object({
    entity_type: z.string().default('product'),
    entity_id: z.string().optional(),
    blob_url: z.string().url(),
    display_order: z.number().int().min(0),
    alt_text: z.string().nullable(),
  })).optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  parent_id: z.string().cuid().nullable().optional(),
})

export const couponSchema = z.object({
  code: z.string().min(1).max(50).transform(s => s.toUpperCase()),
  discount_type: z.enum(['PERCENTAGE', 'FIXED']),
  discount_value: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()),
  min_order_value: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()).nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().default(true),
  valid_from: z.coerce.date().default(() => new Date()),
  valid_until: z.coerce.date().nullable().optional(),
})

export const addressSchema = z.object({
  full_name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().nullable().optional(),
  postal_code: z.string().min(1),
  country: z.string().min(2).max(2),
  phone: z.string().nullable().optional(),
})

export const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  tracking_number: z.string().nullable().optional(),
  tracking_url: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const storeSettingsSchema = z.object({
  store_name: z.string().min(1).max(200).optional(),
  tagline: z.string().nullable().optional(),
  currency: z.string().length(3).optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  whatsapp_url: z.string().url().nullable().optional(),
  shipping_note: z.string().nullable().optional(),
  free_shipping_threshold: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().min(0)).nullable().optional(),
  tax_rate: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().min(0).max(100)).optional(),
})

export const checkoutSchema = z.object({
  customer_email: z.string().email(),
  customer_name: z.string().min(1),
  customer_phone: z.string().nullable().optional(),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  coupon_code: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().nullable().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type CouponInput = z.infer<typeof couponSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
