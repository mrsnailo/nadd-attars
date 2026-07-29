import { getProducts } from "@/lib/db";
import FinderClient from "./FinderClient";
import "./finder.css";

export const dynamic = 'force-dynamic';

export default async function FinderPage() {
  const products = await getProducts();
  return <FinderClient products={products} />;
}
