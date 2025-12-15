import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubscriptionLimitChecker from '@/lib/subscriptionLimits'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with company info
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

    const limitChecker = new SubscriptionLimitChecker(user.company.id, user.company.subscriptionTier)
    
    // Get all limits info
    const [storeCheck, employeeCheck, productCheck] = await Promise.all([
      limitChecker.canAddStore(),
      limitChecker.canAddEmployee(),
      limitChecker.canAddProduct()
    ])

    return NextResponse.json({
      success: true,
      data: {
        subscriptionTier: user.company.subscriptionTier,
        limits: {
          stores: {
            current: storeCheck.current,
            max: storeCheck.limit,
            canAdd: storeCheck.allowed,
            message: storeCheck.message
          },
          employees: {
            current: employeeCheck.current,
            max: employeeCheck.limit,
            canAdd: employeeCheck.allowed,
            message: employeeCheck.message
          },
          products: {
            current: productCheck.current,
            max: productCheck.limit,
            canAdd: productCheck.allowed,
            message: productCheck.message
          }
        }
      }
    })

  } catch (error) {
    console.error('Error fetching subscription limits:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type } = await request.json()

    // Get user with company info
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

    const limitChecker = new SubscriptionLimitChecker(user.company.id, user.company.subscriptionTier)
    
    let checkResult
    switch (type) {
      case 'store':
        checkResult = await limitChecker.canAddStore()
        break
      case 'employee':
        checkResult = await limitChecker.canAddEmployee()
        break
      case 'product':
        checkResult = await limitChecker.canAddProduct()
        break
      default:
        return NextResponse.json(
          { message: 'Invalid type. Must be store, employee, or product' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: checkResult
    })
  } catch (error) {
    console.error('Subscription limit check API error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription limit' },
      { status: 500 }
    )
  }
}
