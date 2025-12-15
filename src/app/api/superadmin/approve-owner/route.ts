import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, ApprovalStatus } from '@prisma/client'
import { generateApiKey, generateApiKeyExpiry } from '@/lib/apiKey'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, action } = await request.json()

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED

    // Update user status and company activation
    const result = await prisma.$transaction(async (tx) => {
      // Update user status
      const user = await tx.user.update({
        where: { id: userId },
        data: { status: newStatus },
        include: { company: true }
      })

      // If approved, activate the company
      if (action === 'approve' && user.company) {
        await tx.company.update({
          where: { id: user.company.id },
          data: { isActive: true }
        })
      }

      return user
    })

    // Auto-generate API key when user is approved
    if (action === 'approve') {
      const apiKey = generateApiKey()
      const apiKeyExpiry = generateApiKeyExpiry()
      
      // Update user with API key
      await prisma.user.update({
        where: { id: userId },
        data: { 
          apiKey: apiKey,
          apiKeyExpiry: apiKeyExpiry
        }
      })
      
      console.log(`✅ Auto-generated API key for approved user: ${result.email}`)
    }

    // TODO: Send email notification to user about approval/rejection

    return NextResponse.json(
      { 
        message: `Owner ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        user: result,
        apiKeyGenerated: action === 'approve' ? true : false
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
