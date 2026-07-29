export const dynamic = 'force-dynamic';
import { getProducts } from "@/lib/db";
import FinderClient from "./FinderClient";

export default async function FinderPage() {
  const products = await getProducts();
  return <FinderClient products={products} />;
}
