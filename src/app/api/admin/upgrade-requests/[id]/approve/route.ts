import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getUpgradeApprovedEmailTemplate } from '@/lib/email-templates/upgrade-approved'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only SUPERADMIN can approve upgrade requests
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }

    const requestId = params.id

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
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.user.id
      }
    })

    // Update the company subscription tier
    const updatedCompany = await prisma.company.update({
      where: { id: upgradeRequest.companyId },
      data: {
        subscriptionTier: upgradeRequest.requestedTier,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    // Send email notification to user
    try {
      const emailTemplate = getUpgradeApprovedEmailTemplate({
        userName: upgradeRequest.user.name || 'User',
        companyName: upgradeRequest.company.name || 'Company',
        upgradeFromTier: upgradeRequest.company.subscriptionTier || 'FREE',
        upgradeToTier: upgradeRequest.requestedTier,
        approvalDate: new Date().toLocaleString('id-ID', {
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
        console.error('Failed to send upgrade approval email to:', upgradeRequest.user.email)
      }
    } catch (emailError) {
      console.error('Error sending upgrade approval email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Upgrade request approved successfully'
    })

  } catch (error) {
    console.error('Error approving upgrade request:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
