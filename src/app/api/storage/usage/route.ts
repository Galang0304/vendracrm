import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StorageTracker from '@/lib/storageTracker'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = session.user.companyId
    const subscriptionTier = session.user.subscriptionTier || 'FREE'
    
    const storageTracker = new StorageTracker(companyId)
    const usage = await storageTracker.getStorageUsage(subscriptionTier)
    
    return NextResponse.json({
      success: true,
      data: usage
    })
  } catch (error) {
    console.error('Storage usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to get storage usage' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileSize } = await request.json()
    
    if (!fileSize || typeof fileSize !== 'number') {
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 })
    }

    const companyId = session.user.companyId
    const subscriptionTier = session.user.subscriptionTier || 'FREE'
    
    const storageTracker = new StorageTracker(companyId)
    const result = await storageTracker.enforceStorageLimit(fileSize, subscriptionTier)
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Storage limit check API error:', error)
    return NextResponse.json(
      { error: 'Failed to check storage limit' },
      { status: 500 }
    )
  }
}
