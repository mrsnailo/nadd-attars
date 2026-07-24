import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization')
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')
      
      // using simple env vars for auth: ADMIN_USER and ADMIN_PASSWORD
      const validUser = process.env.ADMIN_USER || 'admin'
      const validPwd = process.env.ADMIN_PASSWORD || 'admin'

      if (user === validUser && pwd === validPwd) {
        return NextResponse.next()
      }
    }

    return new NextResponse('Auth Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    })
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
