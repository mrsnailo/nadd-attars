import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCart, addToCart, updateCartItem, removeFromCart } from '@/actions/cart'

function getSessionId(request: NextRequest): string {
  return request.cookies.get('cart_session')?.value ?? crypto.randomUUID()
}

export async function GET(request: NextRequest) {
  const sessionId = getSessionId(request)
  const cart = await getOrCreateCart(sessionId)

  const response = NextResponse.json({ cart })
  response.cookies.set('cart_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}

export async function POST(request: NextRequest) {
  const sessionId = getSessionId(request)
  const body = await request.json()
  const { product_id, quantity = 1, action } = body

  let cart
  switch (action) {
    case 'add':
      cart = await addToCart(sessionId, product_id, quantity)
      break
    case 'update':
      cart = await updateCartItem(sessionId, product_id, quantity)
      break
    case 'remove':
      cart = await removeFromCart(sessionId, product_id)
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const response = NextResponse.json({ cart })
  response.cookies.set('cart_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
