import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Test authentication status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          companyId: session.user.companyId,
          companyName: session.user.companyName
        }
      } : null,
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
