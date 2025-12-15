import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, SubscriptionTier } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { requestId, action } = await request.json()

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Get user with company
    const user = await prisma.user.findUnique({
      where: { id: requestId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json(
        { message: 'User atau company tidak ditemukan' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve upgrade - update user and company
      await prisma.$transaction(async (tx) => {
        // Clear payment proof after approval
        await tx.user.update({
          where: { id: user.id },
          data: {
            paymentProof: null,
            paymentMethod: null,
            paymentUploadedAt: null
          }
        })

        // Update company subscription tier to PREMIUM with expiry date
        const subscriptionExpiry = new Date()
        subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1) // 1 month from now
        
        await tx.company.update({
          where: { id: user.company!.id },
          data: {
            subscriptionTier: SubscriptionTier.PREMIUM,
            subscriptionExpiry: subscriptionExpiry,
            isActive: true
          }
        })
      })

      // Send welcome email for upgraded account
      if (user.email && user.name) {
        await sendWelcomeEmail(user.email, user.name, 'PREMIUM')
      }

      return NextResponse.json({
        message: 'Upgrade berhasil disetujui',
        approved: true
      })

    } else if (action === 'reject') {
      // Reject upgrade - clear payment proof
      await prisma.user.update({
        where: { id: user.id },
        data: {
          paymentProof: null,
          paymentMethod: null,
          paymentUploadedAt: null
        }
      })

      return NextResponse.json({
        message: 'Upgrade ditolak',
        approved: false
      })
    }

  } catch (error) {
    console.error('Error processing upgrade:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
