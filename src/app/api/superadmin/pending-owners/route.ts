import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, ApprovalStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all owners (both pending and approved) for SuperAdmin view
    const allOwners = await prisma.user.findMany({
      where: {
        role: UserRole.OWNER
      },
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert BigInt fields to strings for JSON serialization
    const serializedOwners = allOwners.map(owner => ({
      ...owner,
      id: owner.id.toString(),
      company: owner.company ? {
        ...owner.company,
        id: owner.company.id.toString(),
        ownerId: owner.company.ownerId ? owner.company.ownerId.toString() : null
      } : null
    }))

    return NextResponse.json(serializedOwners)

  } catch (error) {
    console.error('Error fetching pending owners:', error)
    console.error('Error details:', error)
    
    // Return empty array instead of error to prevent dashboard crash
    return NextResponse.json([])
  }
}
