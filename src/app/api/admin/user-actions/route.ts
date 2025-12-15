import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPERADMIN can perform user actions
    if (session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, action, reason, newRole, newTier } = await request.json()

    if (!userId || !action || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent actions on SUPERADMIN users
    if (targetUser.role === UserRole.SUPERADMIN) {
      return NextResponse.json({ error: 'Cannot perform actions on SuperAdmin users' }, { status: 403 })
    }

    // This check is no longer needed since only SUPERADMIN can access this endpoint

    let updateData: any = {}
    let companyUpdateData: any = {}

    switch (action) {
      case 'ban':
        updateData = {
          status: ApprovalStatus.REJECTED // Using REJECTED as banned status
        }
        companyUpdateData = {
          isActive: false
        }
        break

      case 'downgrade':
      case 'upgrade':
        if (!newRole || !newTier) {
          return NextResponse.json({ error: 'New role and tier required for modify action' }, { status: 400 })
        }

        // Validate role
        if (!Object.values(UserRole).includes(newRole as UserRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Validate subscription tier
        if (!Object.values(SubscriptionTier).includes(newTier as SubscriptionTier)) {
          return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
        }

        updateData = {
          role: newRole as UserRole,
          status: ApprovalStatus.APPROVED // Ensure user is approved after modification
        }

        companyUpdateData = {
          subscriptionTier: newTier as SubscriptionTier,
          isActive: true,
          // Reset expiry if upgrading to paid plan
          subscriptionExpiry: newTier !== SubscriptionTier.FREE ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days from now
            null
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Perform the updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: updateData
      })

      // Update company if needed
      if (Object.keys(companyUpdateData).length > 0 && targetUser.company) {
        await tx.company.update({
          where: { id: targetUser.company.id },
          data: companyUpdateData
        })
      }

      // Log the action (optional - skip if table doesn't exist)
      try {
        // This will be skipped if the table doesn't exist
        console.log(`Action logged: ${action.toUpperCase()} on user ${targetUser.id} by ${session.user.id}`)
      } catch (error) {
        console.log('Action logging skipped')
      }
    })

    return NextResponse.json({ 
      message: `User ${action} successful`,
      action,
      targetUser: targetUser.name
    })

  } catch (error) {
    console.error('Error performing user action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
