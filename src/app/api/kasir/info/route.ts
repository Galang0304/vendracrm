import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get kasir info (employee, store, company data)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    // Get kasir's complete info
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { 
        company: true,
        store: true
      }
    })

    if (!employee || !employee.company) {
      return NextResponse.json(
        { message: 'Employee or company not found' },
        { status: 404 }
      )
    }

    // Determine current shift based on time
    const currentHour = new Date().getHours()
    let currentShift = 'Shift Pagi'
    if (currentHour >= 14 && currentHour < 22) {
      currentShift = 'Shift Siang'
    } else if (currentHour >= 22 || currentHour < 6) {
      currentShift = 'Shift Malam'
    }

    const kasirInfo = {
      employeeName: employee.name,
      employeeEmail: employee.email,
      storeName: employee.store?.name || 'Semua Toko',
      storeAddress: employee.store?.address || employee.company.address || '-',
      companyName: employee.company.name,
      currentShift: currentShift,
      storePhone: employee.store?.phone || employee.company.phone || '-',
      storeCode: employee.store?.code || 'ALL'
    }

    return NextResponse.json(kasirInfo)

  } catch (error) {
    console.error('Error fetching kasir info:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
