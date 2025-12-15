import { NextRequest, NextResponse } from 'next/server'
import { checkAndUpdateExpiredSubscriptions } from '@/lib/subscriptionChecker'

export async function GET(request: NextRequest) {
  try {
    // Check for authorization header (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await checkAndUpdateExpiredSubscriptions()
    
    return NextResponse.json({
      message: 'Subscription check completed',
      ...result
    })
  } catch (error) {
    console.error('Error in subscription check cron:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow POST requests as well for flexibility
  return GET(request)
}
