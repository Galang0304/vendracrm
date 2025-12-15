import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Debug kasir session and data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔍 Debug Kasir Session:')
    console.log('Session exists:', !!session)
    console.log('User role:', session?.user?.role)
    console.log('User email:', session?.user?.email)
    console.log('Company ID:', session?.user?.companyId)

    if (!session) {
      return NextResponse.json({
        error: 'No session found',
        debug: {
          session: null,
          employee: null,
          products: null
        }
      })
    }

    // Check employee record
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    })

    console.log('Employee found:', !!employee)
    console.log('Employee active:', employee?.isActive)
    console.log('Company active:', employee?.company?.isActive)

    if (!employee) {
      return NextResponse.json({
        error: 'Employee not found',
        debug: {
          session: {
            role: session.user.role,
            email: session.user.email,
            companyId: session.user.companyId
          },
          employee: null,
          products: null
        }
      })
    }

    // Check products for company
    const products = await prisma.product.findMany({
      where: {
        companyId: employee.company.id,
        isActive: true
      }
    })

    console.log('Products found:', products.length)

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          role: session.user.role,
          email: session.user.email,
          companyId: session.user.companyId,
          name: session.user.name
        },
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          isActive: employee.isActive,
          companyId: employee.companyId,
          companyName: employee.company.name,
          companyActive: employee.company.isActive
        },
        products: {
          count: products.length,
          list: products.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            stock: p.stock,
            isActive: p.isActive
          }))
        }
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      debug: null
    })
  }
}
