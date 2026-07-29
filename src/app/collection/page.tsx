export const dynamic = 'force-dynamic';
import { getProducts } from "@/lib/db";
import CollectionClient from "./CollectionClient";

export default async function CollectionPage() {
  const products = await getProducts();
  return <CollectionClient products={products} />;
}
