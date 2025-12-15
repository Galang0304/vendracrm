import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get users who have uploaded payment proof for upgrade requests
    const upgradeRequests = await prisma.user.findMany({
      where: {
        AND: [
          { paymentProof: { not: null } },
          { paymentMethod: { not: null } }
        ]
      },
      include: {
        company: {
          select: {
            name: true,
            subscriptionTier: true
          }
        }
      },
      orderBy: {
        paymentUploadedAt: 'desc'
      }
    })

    // Transform data for frontend
    const requests = upgradeRequests.map(user => ({
      id: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      },
      requestedTier: 'PREMIUM', // Default since we don't have this field in schema yet
      paymentMethod: user.paymentMethod || 'N/A',
      paymentProof: user.paymentProof,
      paymentUploadedAt: user.paymentUploadedAt?.toISOString() || user.createdAt.toISOString(),
      status: 'PENDING'
    }))

    return NextResponse.json({
      requests: requests
    })

  } catch (error) {
    console.error('Error fetching upgrade requests:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
