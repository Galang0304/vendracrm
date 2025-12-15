import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

// POST - SuperAdmin can change any user's password
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only SuperAdmin can change user passwords
    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin access required' },
        { status: 401 }
      )
    }

    const { userId, userEmail, newPassword, changeType } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    let user = null

    // Find user by ID or email
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
      })
    } else if (userEmail) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, email: true, name: true, role: true }
      })
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Log the password change
    console.log(`🔐 SuperAdmin ${session.user.email} changed password for user ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
      message: `Password changed successfully for ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      changedBy: session.user.email,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error changing user password:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get list of users for SuperAdmin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin access required' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
