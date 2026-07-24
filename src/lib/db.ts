export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  size: string;
  family: string;
  stock_count: number;
  created_at: string;
};

export type ProductMetrics = {
  longevity: number;
  sillage: number;
  intensity: number;
};

export type ProductNotes = {
  top_notes: string;
  heart_notes: string;
  base_notes: string;
};

export type ProductImage = {
  blob_url: string;
  alt_text: string;
};

export type ProductFull = Product & {
  metrics: ProductMetrics;
  notes: ProductNotes;
  images: ProductImage[];
};

const mockProducts: ProductFull[] = [
  {
    id: "1",
    slug: "dahn-al-oud",
    name: "Dahn al Oud",
    price: 120,
    currency: "USD",
    size: "3ml",
    family: "Oud",
    stock_count: 10,
    created_at: new Date().toISOString(),
    metrics: { longevity: 90, sillage: 80, intensity: 95 },
    notes: {
      top_notes: "Aged Indian Oud",
      heart_notes: "Cambodian Oud, Rose",
      base_notes: "Musk, Amber"
    },
    images: [{ blob_url: "mock-url-1", alt_text: "Dahn al Oud Vials" }]
  },
  {
    id: "2",
    slug: "amber-rose",
    name: "Amber & Rose",
    price: 85,
    currency: "USD",
    size: "3ml",
    family: "Floral",
    stock_count: 0,
    created_at: new Date().toISOString(),
    metrics: { longevity: 70, sillage: 60, intensity: 75 },
    notes: {
      top_notes: "Taif Rose, Saffron",
      heart_notes: "Ambergris, Jasmine",
      base_notes: "Sandalwood"
    },
    images: [{ blob_url: "mock-url-2", alt_text: "Amber & Rose Bottle" }]
  }
];

export async function getProducts(): Promise<Product[]> {
  // Simulate DB latency
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts.map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { metrics, notes, images, ...rest } = p;
    return rest;
  });
}

export async function getProductBySlug(slug: string): Promise<ProductFull | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = mockProducts.find(p => p.slug === slug);
  return product || null;
}
