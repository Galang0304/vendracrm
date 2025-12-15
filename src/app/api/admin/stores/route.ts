import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import SubscriptionLimitChecker from '@/lib/subscriptionLimits'

// GET - Fetch all stores for the company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      )
    }

    // Fetch stores for the company
    const stores = await prisma.store.findMany({
      where: {
        companyId: user.company.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(stores)

  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new store
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, code, address, phone, email, manager, isActive } = await request.json()

    // Validation
    if (!name || !code || !address) {
      return NextResponse.json(
        { message: 'Name, code, and address are required' },
        { status: 400 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      )
    }

    // Check subscription limits
    const limitChecker = new SubscriptionLimitChecker(user.company.id, user.company.subscriptionTier)
    const canAdd = await limitChecker.canAddStore()
    
    if (!canAdd.allowed) {
      return NextResponse.json(
        { message: canAdd.message },
        { status: 403 }
      )
    }

    // Check if store code already exists for this company
    const existingStore = await prisma.store.findFirst({
      where: {
        companyId: user.company.id,
        code: code
      }
    })

    if (existingStore) {
      return NextResponse.json(
        { message: 'Store code already exists' },
        { status: 400 }
      )
    }

    // Create new store
    const store = await prisma.store.create({
      data: {
        name,
        code,
        address,
        phone: phone || null,
        email: email || null,
        isActive: isActive ?? true,
        companyId: user.company.id
      }
    })

    return NextResponse.json(store, { status: 201 })

  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
