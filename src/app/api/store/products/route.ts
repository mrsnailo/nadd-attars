import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getFilteredProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category') ?? undefined
  const family = searchParams.get('family') ?? undefined
  const featured = searchParams.get('featured')
  const limit = searchParams.get('limit')

  const hasFilters = category || family || featured || limit

  const products = hasFilters
    ? await getFilteredProducts({
        categorySlug: category,
        family,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      })
    : await getProducts()

  return NextResponse.json({ products })
}
