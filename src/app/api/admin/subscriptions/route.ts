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

    // Get all companies with subscription info
    const companies = await prisma.company.findMany({
      where: {
        subscriptionTier: { not: 'FREE' }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        subscriptionExpiry: 'asc'
      }
    })

    // Transform data for frontend
    const accounts = companies.map(company => {
      const now = new Date()
      const expiry = company.subscriptionExpiry ? new Date(company.subscriptionExpiry) : null
      const isExpired = expiry ? expiry < now : false
      const daysRemaining = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

      return {
        id: company.id,
        user: {
          name: company.owner.name || 'N/A',
          email: company.owner.email
        },
        company: {
          name: company.name,
          subscriptionTier: company.subscriptionTier,
          subscriptionExpiry: company.subscriptionExpiry?.toISOString() || null,
          isActive: company.isActive
        },
        daysRemaining: Math.max(0, daysRemaining),
        isExpired
      }
    })

    return NextResponse.json({
      accounts
    })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
