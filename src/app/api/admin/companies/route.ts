import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      )
    }

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(companies)

  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
