import { cookies } from 'next/headers'
import { getOrCreateCart } from '@/actions/cart'
import CartView from './CartView'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart | NAḎḎ Attars',
  description: 'Review your requested allocations from the archive.'
}

export default async function CartPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('cart_session')?.value || ''
  const cart = sessionId ? await getOrCreateCart(sessionId) : null

  return <CartView initialCart={cart as never} />
}
