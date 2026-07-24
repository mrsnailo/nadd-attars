import { NextRequest, NextResponse } from 'next/server'
import { checkout } from '@/actions/cart'
import { checkoutSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'No cart session' }, { status: 400 })
  }

  const body = await request.json()

  const result = checkoutSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const order = await checkout(sessionId, result.data)
    return NextResponse.json({ order, order_number: order.order_number })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
