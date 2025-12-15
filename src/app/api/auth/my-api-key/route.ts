import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get current user's API key
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's API key (placeholder implementation)
    // Note: API key fields don't exist in database yet
    const user = {
      id: session.user.id,
      email: session.user.email,
      apiKey: null, // Placeholder - will be implemented when schema is updated
      apiKeyExpiry: null // Placeholder - will be implemented when schema is updated
    }

    return NextResponse.json({
      apiKey: user.apiKey,
      apiKeyExpiry: user.apiKeyExpiry,
      status: session.user.status
    })

  } catch (error) {
    console.error('Error fetching user API key:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
