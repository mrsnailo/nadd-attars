export const dynamic = 'force-dynamic';
import { getProductBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductClient from "./ProductClient";
import "./product.css";

const BLUR_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const imageUrl = product.images && product.images.length > 0 ? product.images[0].blob_url : undefined;
  const description = product.description || `An impeccable composition belonging to the ${product.family} family. Expertly balanced and aged.`;

  return {
    title: `${product.name} | NAḎḎ Attars`,
    description: description,
    openGraph: {
      title: product.name,
      description: description,
      url: `https://nadd-attars.vercel.app/product/${product.slug}`,
      siteName: 'NAḎḎ Attars',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const hasImage = product.images && product.images.length > 0;
  const imageUrl = hasImage ? product.images[0].blob_url : null;
  const altText = hasImage ? (product.images[0].alt_text || product.name) : product.name;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageUrl ? [imageUrl] : [],
    description: product.description || `An impeccable composition belonging to the ${product.family} family.`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.stock_count > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://nadd-attars.vercel.app/product/${product.slug}`
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient product={product} imageUrl={imageUrl} altText={altText} blurUrl={BLUR_URL} />
    </>
  );
}
