import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { ApprovalStatus, UserRole } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is SUPERADMIN
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser || adminUser.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Access denied. SuperAdmin only.' },
        { status: 403 }
      )
    }

    const { userId, action } = await request.json()

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    if (user.status !== ApprovalStatus.PENDING) {
      return NextResponse.json(
        { message: 'User sudah diproses sebelumnya' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve user and activate company
      await prisma.$transaction(async (tx) => {
        // Update user status
        await tx.user.update({
          where: { id: userId },
          data: {
            status: ApprovalStatus.APPROVED,
            isActive: true,
            approvedAt: new Date()
          }
        })

        // Activate company
        if (user.company) {
          await tx.company.update({
            where: { id: user.company.id },
            data: {
              isActive: true
            }
          })
        }
      })

      // Send welcome email
      if (user.name && user.email && user.company) {
        try {
          await sendWelcomeEmail(
            user.email, 
            user.name, 
            user.company.subscriptionTier
          )
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail the approval if email fails
        }
      }

      return NextResponse.json({
        message: 'User berhasil disetujui dan email selamat datang telah dikirim',
        success: true
      })

    } else if (action === 'reject') {
      // Reject user
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: ApprovalStatus.REJECTED,
          isActive: false
        }
      })

      return NextResponse.json({
        message: 'User berhasil ditolak',
        success: true
      })
    }

  } catch (error) {
    console.error('Error processing user approval:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
