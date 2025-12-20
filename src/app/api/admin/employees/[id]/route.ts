import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

// GET - Fetch single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERLADMIN'].includes(session.user.role)) {
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

    // Fetch employee
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: user.company.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)

  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, isActive } = body

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

    // Check if employee exists and belongs to company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      // Check if new email conflicts with other employees (excluding current employee)
      if (email !== existingEmployee.email) {
        const emailConflict = await prisma.employee.findFirst({
          where: {
            email: email,
            id: { not: id }
          }
        })

        if (emailConflict) {
          return NextResponse.json(
            { message: 'Email already exists' },
            { status: 400 }
          )
        }
      }
      updateData.email = email
    }
    if (password !== undefined && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 12)
    }
    if (role !== undefined) {
      if (!['KASIR'].includes(role)) {
        return NextResponse.json(
          { message: 'Invalid role. Only KASIR is allowed' },
          { status: 400 }
        )
      }
      updateData.role = role as UserRole
    }
    if (isActive !== undefined) updateData.isActive = isActive

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(employee)

  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Check if employee exists and belongs to company
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete employee
    await prisma.employee.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
