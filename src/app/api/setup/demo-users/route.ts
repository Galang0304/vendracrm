import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'

// POST - Create demo users for testing
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Creating demo users...')

    // Hash passwords
    const defaultPassword = await bcrypt.hash('admin123', 12)
    const superAdminPassword = await bcrypt.hash('superadmin123', 12)

    const results = []

    // 1. Create SuperAdmin if not exists
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@vendra.com' },
      update: {},
      create: {
        email: 'superadmin@vendra.com',
        name: 'Super Administrator',
        password: superAdminPassword,
        role: UserRole.SUPERADMIN,
        status: ApprovalStatus.APPROVED,
        emailVerified: new Date(),
      },
    })
    results.push({ type: 'SuperAdmin', email: superAdmin.email, created: true })

    // 2. Create Admin Demo User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        name: 'Demo Admin',
        password: defaultPassword,
        role: UserRole.OWNER,
        status: ApprovalStatus.APPROVED,
        emailVerified: new Date(),
      },
    })
    results.push({ type: 'Admin', email: adminUser.email, created: true })

    // 3. Create Demo Company for Admin
    const demoCompany = await prisma.company.upsert({
      where: { email: 'demo@company.com' },
      update: {},
      create: {
        name: 'Demo Company',
        email: 'demo@company.com',
        phone: '+62812345678',
        address: 'Jl. Demo No. 123, Jakarta',
        subscriptionTier: SubscriptionTier.PREMIUM,
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        ownerId: adminUser.id,
      },
    })
    results.push({ type: 'Company', name: demoCompany.name, created: true })

    // 4. Create Kasir Employee
    const kasirEmployee = await prisma.employee.upsert({
      where: { email: 'kasir@demo.com' },
      update: {},
      create: {
        email: 'kasir@demo.com',
        name: 'Kasir Staff',
        password: defaultPassword,
        role: UserRole.KASIR,
        companyId: demoCompany.id,
      },
    })
    results.push({ type: 'Kasir', email: kasirEmployee.email, created: true })

    // 5. Create Marketing Employee
    const marketingEmployee = await prisma.employee.upsert({
      where: { email: 'marketing@demo.com' },
      update: {},
      create: {
        email: 'marketing@demo.com',
        name: 'Marketing Staff',
        password: defaultPassword,
        role: UserRole.KASIR, // Using KASIR role for marketing employee
        companyId: demoCompany.id,
      },
    })
    results.push({ type: 'Marketing', email: marketingEmployee.email, created: true })

    console.log('✅ Demo users created successfully')

    return NextResponse.json({
      message: 'Demo users created successfully',
      results: results,
      credentials: {
        superadmin: { email: 'superadmin@vendra.com', password: 'superadmin123' },
        admin: { email: 'admin@demo.com', password: 'admin123' },
        kasir: { email: 'kasir@demo.com', password: 'admin123' },
        marketing: { email: 'marketing@demo.com', password: 'admin123' }
      }
    })

  } catch (error) {
    console.error('Error creating demo users:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check demo users status
export async function GET(request: NextRequest) {
  try {
    const users = await Promise.all([
      prisma.user.findUnique({ 
        where: { email: 'superadmin@vendra.com' },
        select: { id: true, email: true, role: true }
      }),
      prisma.user.findUnique({ 
        where: { email: 'admin@demo.com' },
        select: { id: true, email: true, role: true }
      }),
      prisma.employee.findUnique({ 
        where: { email: 'kasir@demo.com' },
        select: { id: true, email: true, role: true }
      }),
      prisma.employee.findUnique({ 
        where: { email: 'marketing@demo.com' },
        select: { id: true, email: true, role: true }
      })
    ])

    const status = {
      superadmin: !!users[0],
      admin: !!users[1],
      kasir: !!users[2],
      marketing: !!users[3],
      allExist: users.every(user => !!user)
    }

    return NextResponse.json({
      status: status,
      message: status.allExist ? 'All demo users exist' : 'Some demo users missing'
    })

  } catch (error) {
    console.error('Error checking demo users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
