import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getUpgradeRejectedEmailTemplate } from '@/lib/email-templates/upgrade-rejected'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only SUPERADMIN can reject upgrade requests
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    const requestId = id
    const { reason } = await request.json()

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { message: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Find the upgrade request
    const upgradeRequest = await prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        company: true
      }
    })

    if (!upgradeRequest) {
      return NextResponse.json(
        { message: 'Upgrade request not found' },
        { status: 404 }
      )
    }

    if (upgradeRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Request already processed' },
        { status: 400 }
      )
    }

    // Update the upgrade request status
    await prisma.upgradeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason
      }
    })

    // Send email notification to user
    try {
      const emailTemplate = getUpgradeRejectedEmailTemplate({
        userName: upgradeRequest.user.name || 'User',
        companyName: upgradeRequest.company.name || 'Company',
        requestedTier: upgradeRequest.requestedTier,
        rejectionReason: reason,
        rejectionDate: new Date().toLocaleString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })

      const emailSent = await sendEmail(
        upgradeRequest.user.email,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      )

      if (!emailSent) {
        console.error('Failed to send upgrade rejection email to:', upgradeRequest.user.email)
      }
    } catch (emailError) {
      console.error('Error sending upgrade rejection email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Upgrade request rejected successfully'
    })

  } catch (error) {
    console.error('Error rejecting upgrade request:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
