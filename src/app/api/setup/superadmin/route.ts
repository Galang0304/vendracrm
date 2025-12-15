import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, ApprovalStatus } from '@prisma/client'

// POST - Create SuperAdmin user (one-time setup)
export async function POST(request: NextRequest) {
  try {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPERADMIN }
    })

    if (existingSuperAdmin) {
      return NextResponse.json(
        { message: 'SuperAdmin already exists', email: existingSuperAdmin.email },
        { status: 200 }
      )
    }

    // Create SuperAdmin
    const superAdminPassword = await bcrypt.hash('superadmin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@vendra.com',
        name: 'Super Administrator',
        password: superAdminPassword,
        role: UserRole.SUPERADMIN,
        status: ApprovalStatus.APPROVED,
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({
      message: 'SuperAdmin created successfully',
      email: superAdmin.email,
      credentials: {
        email: 'superadmin@vendra.com',
        password: 'superadmin123'
      }
    })

  } catch (error) {
    console.error('Error creating SuperAdmin:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}

// GET - Check if SuperAdmin exists
export async function GET(request: NextRequest) {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPERADMIN },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    if (superAdmin) {
      return NextResponse.json({
        exists: true,
        superAdmin: superAdmin
      })
    } else {
      return NextResponse.json({
        exists: false,
        message: 'No SuperAdmin found'
      })
    }

  } catch (error) {
    console.error('Error checking SuperAdmin:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
