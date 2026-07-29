export const dynamic = 'force-dynamic';
import { getProductBySlug, getProducts } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, allProducts] = await Promise.all([
    getProductBySlug(params.slug),
    getProducts()
  ]);
  
  if (!product) {
    notFound();
  }
  
  const relatedProducts = allProducts.filter((p: any) => p.id !== product.id);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}
