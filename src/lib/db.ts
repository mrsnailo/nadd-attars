import prisma from './prisma';
import { unstable_cache } from 'next/cache';

export const getProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        images: {
          where: { entity_type: 'product' },
          orderBy: { display_order: 'asc' },
          take: 1
        },
        notes: true
      }
    });

    return products.map(p => ({
      ...p,
      price: Number(p.price)
    }));
  },
  ['get-products'],
  { tags: ['products'], revalidate: 3600 }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          where: { entity_type: 'product' },
          orderBy: { display_order: 'asc' }
        },
        notes: {
          orderBy: { time: 'asc' }
        },
        metrics: true
      }
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price)
    };
  },
  ['get-product-by-slug'],
  { tags: ['product'], revalidate: 3600 }
);
