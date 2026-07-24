import prisma from './prisma';

export async function getProducts() {
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
}

export async function getProductBySlug(slug: string) {
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
}
