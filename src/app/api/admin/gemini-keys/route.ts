import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGeminiKeyStatus, resetGeminiQuotas } from '@/lib/geminiKeyRotation'

// GET - Get Gemini API key rotation status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = getGeminiKeyStatus()

    return NextResponse.json({
      success: true,
      data: status,
      message: 'Gemini key rotation status retrieved successfully'
    })

  } catch (error) {
    console.error('Error getting Gemini key status:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Reset all quotas (for testing or manual reset)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only SuperAdmin can manually reset quotas
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin only' },
        { status: 401 }
      )
    }

    resetGeminiQuotas()

    return NextResponse.json({
      success: true,
      message: 'All Gemini API key quotas reset successfully'
    })

  } catch (error) {
    console.error('Error resetting Gemini quotas:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
