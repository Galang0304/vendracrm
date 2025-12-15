import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ message: 'No company found' }, { status: 400 })
    }

    // Check if current user's subscription is expired
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 })
    }

    // If subscription is expired and not FREE, downgrade to FREE
    if (company.subscriptionExpiry && 
        new Date(company.subscriptionExpiry) < new Date() && 
        company.subscriptionTier !== 'FREE') {
      
      await prisma.company.update({
        where: { id: company.id },
        data: {
          subscriptionTier: 'FREE',
          subscriptionExpiry: null
        }
      })

      return NextResponse.json({
        message: 'Subscription expired, downgraded to FREE',
        wasDowngraded: true,
        newTier: 'FREE'
      })
    }

    return NextResponse.json({
      message: 'Subscription check completed',
      wasDowngraded: false,
      currentTier: company.subscriptionTier
    })

  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
